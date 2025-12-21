// app/api/videos/[...path]/route.js
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "videos",
      ...params.path
    );

    // Security check: prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    const publicPath = path.join(process.cwd(), "public", "videos");
    if (!normalizedPath.startsWith(publicPath)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get("range");

    if (range) {
      // Handle byte range requests (for video streaming)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "Content-Range",
      };

      return new Response(file, { status: 206, headers });
    } else {
      // Full file request
      const file = fs.readFileSync(filePath);
      const headers = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
        "Access-Control-Allow-Origin": "*",
      };

      return new Response(file, { status: 200, headers });
    }
  } catch (error) {
    console.error("Error serving video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
