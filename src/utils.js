/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} size
 */
export function renderPattern(ctx, w, h, blockSize) {
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, w, h);

	const columns = Math.round(w / blockSize) / 2;
	const rows = Math.round(h / blockSize);

	let offsetY = 0;
	for (let r = 0; r < rows; r++) {
		let offsetX = r % 2 === 0 ? 0 : blockSize;
		for (let i = 0; i < columns; i++) {
			ctx.fillStyle = "#eee";
			ctx.fillRect(offsetX, offsetY, blockSize, blockSize);
			offsetX += blockSize * 2;
		}
		offsetY += blockSize;
	}
}
