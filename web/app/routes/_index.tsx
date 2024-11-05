import {
  redirect,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";
import { getData } from "~/api/fetchApi";

export const clientLoader = async () => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/login`)
  }
  // トークンが取得できれば月次報告画面に遷移する
  const data = await getData("/user", idToken)
  return redirect('/monthly/')
};

export const clientAction = async() => {}

export default function Index() {
  return (<></>);
}
