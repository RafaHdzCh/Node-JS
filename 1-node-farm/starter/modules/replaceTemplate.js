module.exports = function ReplaceTemplate(template, product)
{
  let output = template
    .replaceAll("{%IMAGE%}", product.image)
    .replaceAll("{%NAME%}", product.productName)
    .replaceAll("{%QUANTITY%}", product.quantity)
    .replaceAll("{%PRICE%}", product.price)
    .replaceAll("{%FROM%}", product.from)
    .replaceAll("{%NUTRIENTS%}", product.nutrients)
    .replaceAll("{%DESCRIPTION%}", product.description)
    .replaceAll("{%ID%}", product.id);
 
  if (!product.organic)
    output = output.replaceAll("{%NOT_ORGANIC%}", "not-organic");
 
  return output;
}