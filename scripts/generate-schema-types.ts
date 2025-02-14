import fs from "fs/promises";
import path from "path";
import { compileFromFile } from "json-schema-to-typescript";
import chokidar from "chokidar";

async function convertSchemaToType(file: string): Promise<void> {
  try {
    const ts: string = await compileFromFile(file);
    const outputFilePath = path.join(
      path.dirname(file),
      path.basename(file, ".json") + ".d.ts"
    );
    await fs.writeFile(outputFilePath, ts);
    console.log(`Конвертировано: ${file} -> ${outputFilePath}`);
  } catch (error) {
    console.error(`Ошибка при конвертации файла ${file}:`, error);
  }
}

function watchSchemas(relativePath: string): void {
  const directory: string = path.join(process.cwd(), relativePath);

  const watcher = chokidar.watch(path.join(directory, "*.json"), {
    ignored: (path: string) => path.startsWith("."), // Игнорировать скрытые файлы
    persistent: true,
    ignoreInitial: false,
  });

  watcher
    .on("add", async (file) => {
      console.log(`Найден новый файл: ${file}`);
      await convertSchemaToType(file);
    })
    .on("change", async (file) => {
      console.log(`Обнаружены изменения в файле: ${file}`);
      await convertSchemaToType(file);
    })
    .on("error", (error) => {
      console.error(`Ошибка при отслеживании файлов:`, error);
    });
}

// Использование аргумента командной строки для указания относительного пути
const relativePath: string = process.argv[2];
if (!relativePath) {
  console.error("Не указан путь к директории со схемами.");
  process.exit(1);
}

watchSchemas(relativePath);
