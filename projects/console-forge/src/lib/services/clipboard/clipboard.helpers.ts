/**
 * Extracts plain text from a ClipboardItem, if available.
 *
 * @param clipboardItem - The ClipboardItem to extract text from.
 * @returns A promise that resolves to the extracted text, or null if no text is present.
 */
export async function getTextFromClipboardItem(clipboardItem?: ClipboardItem): Promise<string | null> {
    const textMimeType = "text/plain";

    if (!clipboardItem?.types?.includes(textMimeType)) {
        return null;
    }

    const blob = await clipboardItem.getType(textMimeType);
    if (!blob) {
        return null;
    }

    return blob.text();
}

export function getClipboardItemFromText(text: string): ClipboardItem {
    return new ClipboardItem({ 'text/plain': new Blob([text], { type: 'text/plain' }) });
}
