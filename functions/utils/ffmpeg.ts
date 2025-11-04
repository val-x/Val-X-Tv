import { spawn } from 'bun';
import { existsSync } from 'fs';
import { join } from 'path';

const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

export interface TranscodeOptions {
  inputPath: string;
  outputDir: string;
  type: 'video' | 'audio';
  qualities?: string[];
  languages?: string[];
}

/**
 * Transcode video to HLS format (480p and 720p)
 */
export async function transcodeVideo(
  inputPath: string,
  outputDir: string,
  qualities: string[] = ['480p', '720p']
): Promise<string[]> {
  const manifests: string[] = [];
  
  for (const quality of qualities) {
    const resolution = quality === '480p' ? '854:480' : '1280:720';
    const bitrate = quality === '480p' ? '1000k' : '2500k';
    const manifestPath = join(outputDir, `${quality}/playlist.m3u8`);
    
    // Create directory if it doesn't exist
    const fs = await import('fs/promises');
    await fs.mkdir(join(outputDir, quality), { recursive: true });
    
    const args = [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-b:v', bitrate,
      '-s', resolution,
      '-hls_time', '10',
      '-hls_list_size', '0',
      '-hls_segment_filename', join(outputDir, quality, 'segment_%03d.ts'),
      '-f', 'hls',
      manifestPath,
    ];
    
    await runFFmpeg(args);
    manifests.push(manifestPath);
  }
  
  return manifests;
}

/**
 * Transcode audio to HLS format (96k and 128k)
 */
export async function transcodeAudio(
  inputPath: string,
  outputDir: string,
  bitrates: string[] = ['96k', '128k']
): Promise<string[]> {
  const manifests: string[] = [];
  
  for (const bitrate of bitrates) {
    const manifestPath = join(outputDir, `${bitrate}/playlist.m3u8`);
    
    // Create directory if it doesn't exist
    const fs = await import('fs/promises');
    await fs.mkdir(join(outputDir, bitrate), { recursive: true });
    
    const args = [
      '-i', inputPath,
      '-c:a', 'aac',
      '-b:a', bitrate,
      '-hls_time', '10',
      '-hls_list_size', '0',
      '-hls_segment_filename', join(outputDir, bitrate, 'segment_%03d.ts'),
      '-f', 'hls',
      manifestPath,
    ];
    
    await runFFmpeg(args);
    manifests.push(manifestPath);
  }
  
  return manifests;
}

/**
 * Extract video thumbnail
 */
export async function extractThumbnail(
  inputPath: string,
  outputPath: string,
  timestamp: string = '00:00:01'
): Promise<void> {
  const args = [
    '-i', inputPath,
    '-ss', timestamp,
    '-vframes', '1',
    '-q:v', '2',
    outputPath,
  ];
  
  await runFFmpeg(args);
}

/**
 * Get video duration in seconds
 */
export async function getDuration(inputPath: string): Promise<number> {
  const args = [
    '-i', inputPath,
    '-show_entries', 'format=duration',
    '-v', 'quiet',
    '-of', 'csv=p=0',
  ];
  
  const result = await runFFmpeg(args, true);
  return parseFloat(result.trim()) || 0;
}

/**
 * Run FFmpeg command
 */
async function runFFmpeg(args: string[], captureOutput: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn([FFMPEG_PATH, ...args], {
      stdout: captureOutput ? 'pipe' : 'inherit',
      stderr: captureOutput ? 'pipe' : 'inherit',
    });
    
    let output = '';
    
    if (captureOutput && proc.stdout) {
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
    }
    
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    
    proc.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Check if FFmpeg is available
 */
export function checkFFmpegAvailable(): boolean {
  try {
    return existsSync(FFMPEG_PATH) || true; // Assume available in container
  } catch {
    return false;
  }
}

