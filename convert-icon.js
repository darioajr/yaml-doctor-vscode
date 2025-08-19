const sharp = require('sharp');
const fs = require('fs');

async function convertSvgToPng() {
  try {
    // Ler o arquivo SVG
    const svgBuffer = fs.readFileSync('icon.svg');
    
    // Converter para PNG com 128x128 pixels (tamanho recomendado para ícones do VS Code)
    await sharp(svgBuffer)
      .png()
      .resize(128, 128)
      .toFile('icon.png');
    
    console.log('✅ Ícone convertido com sucesso: icon.png');
  } catch (error) {
    console.error('❌ Erro ao converter ícone:', error);
  }
}

convertSvgToPng();
