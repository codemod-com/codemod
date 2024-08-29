import { Upload } from "@phosphor-icons/react";

interface ImportDataButtonProps<T> {
  id: string;
  onImport: (data: T) => void;
  buttonText?: string;
  className?: string;
  iconSize?: number;
  onError?: (error: Error) => void;
}

function ImportDataButton<T>({
  id,
  onImport,
  className = "text-blue-600 hover:text-blue-800",
  iconSize = 24,
  onError,
}: ImportDataButtonProps<T>) {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string) as T;
          onImport(importedData);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          if (onError) {
            onError(
              new Error(
                "Error parsing JSON file. Please make sure the file is valid JSON.",
              ),
            );
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <label
      htmlFor={id}
      className={`relative cursor-pointer flex items-center ${className}`}
    >
      <Upload size={iconSize} className="m-0 right-1/2 bottom-1/2" />
      <input
        id={id}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />
    </label>
  );
}

export default ImportDataButton;
