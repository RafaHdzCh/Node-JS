export function HideAlert()
{
  const element = document.querySelector(".alert");
  if(element)
  {
    element.parentElement.removeChild(element);
  }
}


export function ShowAlert(type, message)
{
  const markup = 
  `
    <div class="alert alert--${type}> 
      ${message} 
    </div>"
  `;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(HideAlert, 5000);
}