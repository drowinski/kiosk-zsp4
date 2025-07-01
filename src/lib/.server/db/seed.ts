import * as readline from 'node:readline/promises';
import { assetTable } from '@/features/assets/.server/assets.db';
import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';
import { ReadStream } from 'node:fs';

const base64TestImage =
  'iVBORw0KGgoAAAANSUhEUgAAAaQAAAEsCAIAAAADzVDXAAAFGGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTAtMzFUMjA6MTI6MDcrMDEwMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjQtMTAtMzFUMjA6Mjg6MTcrMDE6MDAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMTAtMzFUMjA6Mjg6MTcrMDE6MDAiCiAgIHBob3Rvc2hvcDpEYXRlQ3JlYXRlZD0iMjAyNC0xMC0zMVQyMDoxMjowNyswMTAwIgogICBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIgogICBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiCiAgIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSI0MjAiCiAgIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIzMDAiCiAgIGV4aWY6Q29sb3JTcGFjZT0iMSIKICAgdGlmZjpJbWFnZVdpZHRoPSI0MjAiCiAgIHRpZmY6SW1hZ2VMZW5ndGg9IjMwMCIKICAgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIKICAgdGlmZjpYUmVzb2x1dGlvbj0iMzAwLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjMwMC8xIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0icHJvZHVjZWQiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFmZmluaXR5IFBob3RvIDIgMi41LjUiCiAgICAgIHN0RXZ0OndoZW49IjIwMjQtMTAtMzFUMjA6Mjg6MTcrMDE6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0iciI/PseiTOQAAAGAaUNDUHNSR0IgSUVDNjE5NjYtMi4xAAAokXWRz0tCQRDHP2pRmGFQhw5BEtbJogyiLkFKVCAhZpDVRZ+/ArXHe0pI16CrUBB16deh/oK6Bp2DoCiC6Ny5qEvJa14KSuQss/PZ7+4Mu7NgDWeUrN40DNlcXgvN+FxLkWVXyyt2eumkDU9U0dWpYDBAQ/t8wGLGu0GzVuNz/1pbPKErYGkVnlRULS88KxzYyKsm7wp3KeloXPhc2KPJBYXvTT1W4VeTUxX+NlkLh/xg7RB2peo4VsdKWssKy8txZzMFpXof8yWORG5xQWKfeA86IWbw4WKOafyMMcKEzGMM4mVIVjTIH/7Nn2ddchWZVYporJEiTR6PqAWpnpCYFD0hI0PR7P/fvurJUW+lusMHzS+G8d4PLTtQLhnG17FhlE/A9gxXuVr++hGMf4heqmnuQ3BuwcV1TYvtweU2dD+pUS36K9nErckkvJ1BewQ6b8G+UulZdZ/TRwhvylfdwP4BDMh55+oPeYtn7mMLZcUAAAAJcEhZcwAALiMAAC4jAXilP3YAAAPuSURBVHic7dTBDcAgEMCw0slvdLYAidgT5JU1Mx/A6/7bAQAnmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkCC2QEJZgckmB2QYHZAgtkBCWYHJJgdkGB2QILZAQlmBySYHZBgdkDCBvy6A9iNCIc7AAAAAElFTkSuQmCC';

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getRandomDate(from: Date, to: Date) {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  return new Date(fromTime + Math.random() * (toTime - fromTime));
}

async function testSeed() {
  const answer = await input.question(
    'This action will delete entries from the database. Are you sure you want to proceed? (yes/no) '
  );
  if (answer.trim().toLowerCase() !== 'yes') {
    process.exit(2);
  }

  const { db } = await import('@/lib/.server/db/connection');

  await db.delete(assetTable);

  const { assetService } = await import('@/features/assets/.server/assets.service');

  for (let i = 0; i < 200; i++) {
    const imageBuffer = Buffer.from(base64TestImage, 'base64');
    const imageStream = new Readable();
    imageStream.push(imageBuffer);
    imageStream.push(null);
    const dateMin = getRandomDate(new Date(1920, 0, 1), new Date());
    const dateMax = new Date(dateMin.getTime() + 1000 * 60 * 60 * 24 * Math.random() * 3650);
    await assetService.uploadAsset(imageStream as unknown as ReadStream, {
      mimeType: 'image/png',
      description: 'random description',
      date: Math.random() > 0.05 ? {
        dateMin: dateMin,
        dateMax: dateMax,
        datePrecision: ['day', 'month', 'year', 'decade'].at(Math.random() * 4) as 'day',
        dateIsRange: Math.random() > 0.5
      } : null
    });
  }

  process.exit(0);
}

await testSeed();
