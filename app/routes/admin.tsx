import {
  useLoaderData,
  redirect,
  Outlet,
} from "@remix-run/react";
import { getIdToken } from "~/api/auth";

export const clientLoader = async () => {
  // データを取ってくる
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }else{
    return {
      idToken: idToken,
    };
  }
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }
  return (
    <div>
      <ul className="nav">
        <li className="nav-item">
          <a className="nav-link" href="after_school" onClick={(e) => (console.log(e))}>学童情報</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="instructor">指導員情報</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="users">ユーザ設定</a>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
