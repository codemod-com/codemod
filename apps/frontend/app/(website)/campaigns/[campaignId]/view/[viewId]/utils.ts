export function formatDuration(isoDuration: string): string {
  const extractNumber = (str: string, char: string): number => {
    const match = str.match(new RegExp(`(\\d+)${char}`));
    return match ? Number.parseInt(match[1], 10) : 0;
  };

  try {
    const duration = isoDuration.replace("PT", "");

    const hours = extractNumber(duration, "H");
    const minutes = extractNumber(duration, "M");

    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim() || "0m";
  } catch (error) {
    console.error("Błąd podczas parsowania czasu trwania:", error);
    return "Invalid duration";
  }
}
