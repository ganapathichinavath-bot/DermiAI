from __future__ import annotations

import csv
import random
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset

from gradcam import CLASS_NAMES, DermClassifier, IMG_SIZE


ROOT = Path(__file__).resolve().parent.parent
DATASET_ROOT = ROOT / "Datasets"
IMAGES_DIRS = [DATASET_ROOT / "HAM10000_images_part_1", DATASET_ROOT / "HAM10000_images_part_2"]
METADATA_PATH = DATASET_ROOT / "HAM10000_metadata.csv"
OUTPUT_PATH = Path(__file__).resolve().parent / "models" / "skin_model.pt"


class HamDataset(Dataset):
    def __init__(self, rows: list[dict]) -> None:
        self.rows = rows

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        row = self.rows[index]
        image_path = row["image_path"]
        image = Image.open(image_path).convert("RGB").resize((IMG_SIZE, IMG_SIZE))
        tensor = torch.from_numpy(np.asarray(image).astype(np.float32) / 255.0).permute(2, 0, 1)
        label = torch.tensor(CLASS_NAMES.index(row["dx"]), dtype=torch.long)
        return tensor, label


def load_rows() -> list[dict]:
    image_map = {}
    for directory in IMAGES_DIRS:
        for image_path in directory.glob("*.jpg"):
            image_map[image_path.stem] = image_path

    rows: list[dict] = []
    with METADATA_PATH.open("r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            image_path = image_map.get(row["image_id"])
            if image_path and row["dx"] in CLASS_NAMES:
                rows.append({"dx": row["dx"], "image_path": image_path})
    return rows


def split_rows(rows: list[dict], validation_ratio: float = 0.15) -> tuple[list[dict], list[dict]]:
    random.shuffle(rows)
    split = int(len(rows) * (1 - validation_ratio))
    return rows[:split], rows[split:]


def run_epoch(model: nn.Module, loader: DataLoader, optimizer: torch.optim.Optimizer | None, device: torch.device) -> tuple[float, float]:
    training = optimizer is not None
    model.train(training)
    total_loss = 0.0
    total_correct = 0
    total_examples = 0

    for inputs, labels in loader:
        inputs = inputs.to(device)
        labels = labels.to(device)

        logits, _ = model(inputs)
        loss = F.cross_entropy(logits, labels)

        if training:
            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            optimizer.step()

        total_loss += loss.item() * labels.size(0)
        total_correct += (logits.argmax(dim=1) == labels).sum().item()
        total_examples += labels.size(0)

    return total_loss / max(total_examples, 1), total_correct / max(total_examples, 1)


def main() -> None:
    random.seed(42)
    torch.manual_seed(42)

    rows = load_rows()
    train_rows, val_rows = split_rows(rows)

    train_loader = DataLoader(HamDataset(train_rows), batch_size=32, shuffle=True, num_workers=0)
    val_loader = DataLoader(HamDataset(val_rows), batch_size=32, shuffle=False, num_workers=0)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = DermClassifier().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

    best_state = None
    best_accuracy = 0.0
    for epoch in range(1, 9):
        train_loss, train_acc = run_epoch(model, train_loader, optimizer, device)
        val_loss, val_acc = run_epoch(model, val_loader, None, device)
        print(
            f"epoch={epoch} train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.4f}"
        )
        if val_acc > best_accuracy:
            best_accuracy = val_acc
            best_state = {key: value.cpu() for key, value in model.state_dict().items()}

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    torch.save({"state_dict": best_state or model.state_dict(), "best_accuracy": best_accuracy}, OUTPUT_PATH)
    print(f"saved checkpoint to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
