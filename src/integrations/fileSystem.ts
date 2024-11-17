export async function getMarkdownFilesFromDirectory(
  directory: string
): Promise<string[]> {
  const results: string[] = [];
  const entries = await Deno.readDir(directory);

  for await (const entry of entries) {
    if (entry.isDirectory) {
      results.push(
        ...(await getMarkdownFilesFromDirectory(`${directory}/${entry.name}`))
      );
    } else if (entry.isFile && entry.name.endsWith(".md")) {
      results.push(`${directory}/${entry.name}`);
    }
  }
  return results;
}

export async function getFileContent(fullPath: string): Promise<string> {
  const content = await Deno.readTextFile(fullPath);
  return content;
}


