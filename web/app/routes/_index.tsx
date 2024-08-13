import {
  Outlet,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";
import { getData } from "~/api/fetchApi";
import { Header } from '~/components/header'

export const clientLoader = async () => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/login`)
  }
  // トークンが取得できればユーザデータを取得する
  const data = await getData("/user", idToken)
  data.idToken = idToken
  return data
};

export const clientAction = async() => {}

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }
  return (
    <div>
      {Header(data.user_data)}
      <Outlet />
    </div>
  );
}
