import "@babel/polyfill";
import axios from "axios";
import { ShowAlert } from "./alerts";

export async function Login(email,password)
{
  try
  {
    const result = await axios(
      {
        method: "POST",
        url: "http://127.0.0.1:3000/api/v1/users/login",
        data:
        {
          email,
          password
        }
      });

      if(result.data.status === "success")
      {
        ShowAlert("success","Logged in!");
        window.setTimeout(() => 
        {
          location.assign("/")
        }, 1000);
      }
  }
  catch(error)
  {
    ShowAlert("error", error.response.data.message);
  }
}

export async function LogOut()
{
  console.log("click logout")
  try
  {
    const result = await axios(
      {
        method: "GET",
        url: "http://127.0.0.1:3000/api/v1/users/logout",
      });
      console.log(result);
      location.reload(true);
  }
  catch(error)
  {
    ShowAlert("error", "Error logging out!");
  }
}