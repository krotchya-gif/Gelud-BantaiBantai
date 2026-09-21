Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $PSScriptRoot '../public/icons'
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null
foreach ($entry in @(@('icon-192.png', 192), @('icon-512.png', 512), @('maskable-512.png', 512), @('apple-touch-icon.png', 180))) {
  $size = [int]$entry[1]
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = 'AntiAlias'
  $graphics.TextRenderingHint = 'AntiAliasGridFit'
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#0b0e1a'))
  $gold = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#ffd34e'))
  $ink = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#0b0e1a'))
  $graphics.FillEllipse($gold, [single]($size * 0.16), [single]($size * 0.16), [single]($size * 0.68), [single]($size * 0.68))
  $font = New-Object System.Drawing.Font('Arial', ([single]($size * 0.25)), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = 'Center'
  $format.LineAlignment = 'Center'
  $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
  $graphics.DrawString('GB', $font, $ink, $rect, $format)
  $bitmap.Save((Join-Path $iconDirectory $entry[0]), [System.Drawing.Imaging.ImageFormat]::Png)
  $font.Dispose(); $format.Dispose(); $gold.Dispose(); $ink.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
