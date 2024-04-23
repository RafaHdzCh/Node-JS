import "@babel/polyfill";
import {DisplayMap} from "./mapbox"
import {Login, LogOut} from "./login";
import {UpdateSettings} from "./updateSettings";

const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logOutButton = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");

if(mapBox)
{
  const locations = JSON.parse(mapBox.dataset.locations);
  DisplayMap(locations);  
}

if(loginForm)
{
  loginForm.addEventListener("submit", event =>
  {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    Login(email,password);
  });
}

if(logOutButton)
{
  //console.log(LogOut)
  logOutButton.addEventListener("click", LogOut);
}

if(userDataForm)
{
  userDataForm.addEventListener("submit", event =>
  {
    event.preventDefault();

    const form = new FormData();

    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    UpdateSettings(form, "data");
  });
}

if(userPasswordForm)
{
  userPasswordForm.addEventListener("submit", async event =>
  {
    event.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating..."
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await UpdateSettings({passwordCurrent, password, passwordConfirm}, "password");

    document.querySelector(".btn--save-password").textContent = "SAVE PASSWORD"
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}
