import {
  Outlet,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";
import { Header } from '~/components/header'

export const clientLoader = async () => {
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/login`)
  }
  // トークンが取得できればユーザデータを取得する
  return {
    'user_name': 'test_user',
    'admin': true,
  }
};

export const clientAction = async() => {}

export default function Index() {
  const user_data = useLoaderData<typeof clientLoader>()
  console.log(user_data)
  return (
    <div>
      {Header(user_data)}
      <Outlet />
    </div>
  );
}
