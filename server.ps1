param([int]$port = 3000)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Server listening at $prefix"
} catch {
    $port = 8080
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Host "Port 3000 in use, shifted to $prefix"
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".png"   = "image/png"
    ".svg"   = "image/svg+xml"
    ".json"  = "application/json"
    ".ico"   = "image/x-icon"
    ".woff2" = "font/woff2"
}

$root = (Get-Item -Path ".").FullName

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            $request = $context.Request
            $response = $context.Response

            $rawUrl = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
            if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
                $rawUrl = "/index.html"
            }

            $relative = $rawUrl.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $root $relative

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = $mimeTypes[$ext]
                if (-not $contentType) { $contentType = "application/octet-stream" }
                $response.ContentType = $contentType

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $notFound.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($notFound, 0, $notFound.Length)
                }
            }
        } catch {
            # Catch individual request/socket disconnect errors without terminating server
        } finally {
            try { $response.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
