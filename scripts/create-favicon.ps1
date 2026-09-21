Add-Type -AssemblyName System.Drawing
foreach ($size in @(48,180,192)) {
$b=[Drawing.Bitmap]::new($size,$size)
$g=[Drawing.Graphics]::FromImage($b)
$g.Clear([Drawing.ColorTranslator]::FromHtml('#153b31'))
$g.TextRenderingHint='AntiAliasGridFit'
$f=[Drawing.Font]::new('Arial',($size*0.38),[Drawing.FontStyle]::Bold,[Drawing.GraphicsUnit]::Pixel)
$brush=[Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#d0f895'))
$format=[Drawing.StringFormat]::new()
$format.Alignment='Center'
$format.LineAlignment='Center'
$g.DrawString('LR',$f,$brush,[Drawing.RectangleF]::new(0,0,$size,$size),$format)
$b.Save((Join-Path $PSScriptRoot "../public/assets/favicon-$size.png"),[Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $b.Dispose(); $f.Dispose(); $brush.Dispose(); $format.Dispose()
}
$png=[IO.File]::ReadAllBytes((Join-Path $PSScriptRoot '../public/assets/favicon-48.png'))
$stream=[IO.File]::Create((Join-Path $PSScriptRoot '../public/favicon.ico'))
$writer=[IO.BinaryWriter]::new($stream)
$writer.Write([uint16]0);$writer.Write([uint16]1);$writer.Write([uint16]1)
$writer.Write([byte]48);$writer.Write([byte]48);$writer.Write([byte]0);$writer.Write([byte]0)
$writer.Write([uint16]1);$writer.Write([uint16]32);$writer.Write([uint32]$png.Length);$writer.Write([uint32]22);$writer.Write($png);$writer.Dispose()
