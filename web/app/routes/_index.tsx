import {
  Outlet,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";
import { getData } from "~/api/fetchApi";
import { Header } from '~/components/header'
import { viewMonth } from "~/components/util";

export const clientLoader = async () => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/login`)
  }
  // トークンが取得できれば月次報告画面に遷移する
  const data = await getData("/user", idToken)
  if(data.user_data.after_schools.length > 0){
    return redirect(`/monthly/${data.user_data.after_schools[0].school_id}/${viewMonth()}`)
  }
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
