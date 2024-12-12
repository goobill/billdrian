import { promises as fs } from 'fs';
import { join } from 'path';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeMinify from 'rehype-preset-minify';
import { read, write } from 'to-vfile';
import { unified } from 'unified';

async function minifyHtml(inputFile, outputFile) {
  const file = await unified()
    .use(rehypeParse, { emitParseErrors: true, fragment: false })
    .use(rehypeMinify)
    .use(rehypeStringify)
    .process(await read(inputFile));

  file.path = outputFile;
  await write(file);
}

async function processHtmlFilesInDirectory(directory) {
  try {
    const files = await fs.readdir(directory);
    const htmlFiles = files.filter((file) => file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js'));

    for (const file of htmlFiles) {
      const inputFile = join(directory, file);
      await minifyHtml(inputFile, inputFile);
      console.log(`Minified: ${inputFile} -> ${inputFile}`);
    }
  } catch (error) {
    console.error(`Error processing directory: ${error.message}`);
  }
}

await processHtmlFilesInDirectory('.');
await processHtmlFilesInDirectory('style');
// await processHtmlFilesInDirectory('scripts');
