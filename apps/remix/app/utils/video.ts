export function getVideoUrl(url: string, quality: "480"| "720" | "1080", size: "sq"| "ws") {
  return url.replace("<quality>", `${quality}${size}`).replace("<shape>", size)
}