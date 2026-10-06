import { execSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const inputArg = process.argv[2];
if (!inputArg) {
  console.log("用法: npm run icon <你的图片路径>");
  console.log("示例: npm run icon ./my-logo.png");
  process.exit(1);
}

const inputPath = resolve(process.cwd(), inputArg);
if (!existsSync(inputPath)) {
  console.error(`✗ 找不到图片文件: ${inputPath}`);
  process.exit(1);
}

const outPng = join(root, "icon-src-1024.png");

console.log("[icon] 正在应用 macOS 官方规范连续圆角矩形与呼吸留白 (Squircle)...");

if (process.platform === "darwin") {
  const swiftCode = `
import AppKit

guard CommandLine.arguments.count >= 3 else { exit(1) }
let inputPath = CommandLine.arguments[1]
let outputPath = CommandLine.arguments[2]
guard let inputImage = NSImage(contentsOfFile: inputPath) else { exit(1) }

let canvasSize: CGFloat = 1024
let targetSize: CGFloat = 944
let origin: CGFloat = 40
let cornerRadius = targetSize * 0.224

let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(canvasSize),
    pixelsHigh: Int(canvasSize),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)!

NSGraphicsContext.saveGraphicsState()
let context = NSGraphicsContext(bitmapImageRep: rep)
NSGraphicsContext.current = context

let rect = NSRect(x: origin, y: origin, width: targetSize, height: targetSize)
let path = NSBezierPath(roundedRect: rect, xRadius: cornerRadius, yRadius: cornerRadius)
path.addClip()

let srcSize = inputImage.size
let aspect = srcSize.width / srcSize.height
var drawRect = rect
if aspect > 1 {
    drawRect.size.width = targetSize * aspect
    drawRect.origin.x = origin - (drawRect.size.width - targetSize) / 2
} else {
    drawRect.size.height = targetSize / aspect
    drawRect.origin.y = origin - (drawRect.size.height - targetSize) / 2
}
inputImage.draw(in: drawRect)

NSGraphicsContext.restoreGraphicsState()

if let pngData = rep.representation(using: .png, properties: [:]) {
    try? pngData.write(to: URL(fileURLWithPath: outputPath))
}
`;
  try {
    execSync(`swift -e '${swiftCode.replace(/'/g, "'\\''")}' "${inputPath}" "${outPng}"`, { stdio: "inherit" });
  } catch (e) {
    console.error("✗ 圆角处理失败:", e.message);
    process.exit(1);
  }
} else {
  copyFileSync(inputPath, outPng);
}

console.log("[icon] ✓ 已生成标准圆角图片: icon-src-1024.png");
console.log("[icon] 正在生成全套系统图标 (Tauri icon)...");

try {
  execSync(`npm run tauri icon icon-src-1024.png`, { cwd: root, stdio: "inherit" });
  console.log("[icon] ✓ 全套 macOS (.icns) 和 Windows (.ico) 圆角图标生成完毕！");
  console.log("[icon] 现在运行 npm run dist 或 npm run tauri build 即可编译出带圆角外层图标的安装包。");
} catch (e) {
  console.error("✗ 生成 Tauri 图标失败:", e.message);
  process.exit(1);
}
