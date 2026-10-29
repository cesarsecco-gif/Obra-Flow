export async function comprimirImagem(
  arquivo: File,
  larguraMaxima = 1280,
  qualidade = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.readAsDataURL(arquivo);
    leitor.onload = (evento) => {
      const img = new Image();
      img.src = evento.target?.result as string;
      img.onload = () => {
        const proporcao = img.height / img.width;
        const largura = Math.min(img.width, larguraMaxima);
        const altura = largura * proporcao;

        const canvas = document.createElement('canvas');
        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Falha ao obter contexto 2D do Canvas'));

        ctx.drawImage(img, 0, 0, largura, altura);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Falha ao gerar Blob comprimido'));
          },
          'image/jpeg',
          qualidade
        );
      };
      img.onerror = (err) => reject(err);
    };
    leitor.onerror = (err) => reject(err);
  });
}
