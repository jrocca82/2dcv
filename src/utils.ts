import { KaboomCtx } from "kaboom";

export const displayDialogue = (text: string, onDisplayEnd: () => void) => {
    const dialogueUi = document.getElementById("textbox-container");

    const dialogue = document.getElementById("dialogue");

    if (!dialogue || !dialogueUi) {
        return
    }

    dialogueUi.style.display = "block";

    // Make text scrollable if needed
    let index = 0;
    let currentText = "";

    const intervalRef = setInterval(() => {
        if (index < text.length) {
            currentText += text[index];
            dialogue.innerHTML = currentText;
            index++;
            return
        }

        clearInterval(intervalRef);
    }, 5);

    const closeButton = document.getElementById("close-butn");

    const onClose = () => {
        onDisplayEnd();
        dialogueUi.style.display = "none";
        dialogue.innerHTML = "";
        clearInterval(intervalRef);
        closeButton?.removeEventListener("click", onClose);
    }

    closeButton?.addEventListener("click", onClose);
}

export const setCamScale = (k: KaboomCtx) => {
    const resizeFactor = k.width() / k.height();

    if (resizeFactor < 1) {
        k.camScale(k.vec2(1));
        return;
    }

    k.camScale(k.vec2(1.5));
}