import { LinksFunction } from "@remix-run/node";
import {
  useLoaderData,
  redirect,
  Outlet,
  useNavigate,
} from "@remix-run/react";
import { useState } from "react";
import { getIdToken } from "~/api/auth";
import { getData } from "~/api/fetchApi";
import { Header } from "~/components/header";
import { getLs } from "~/lib/ls";

const pages = [
  {link: './after_school', name: '学童情報'},
  {link: './instructor', name: '指導員情報'},
  {link: './users', name: 'ユーザ設定'},
]

export const clientLoader = async () => {
  const idToken = getLs('idToken') || ''
  const data = JSON.parse(getLs('user_data') || '{}')
  data.idToken = idToken
  return data
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }

  const child_data = {
    after_schools: data.user_data.after_schools
  }

  return (
    <div>
      {Header(data.user_data)}
      <Outlet context={child_data}/>
    </div>
  );
}
