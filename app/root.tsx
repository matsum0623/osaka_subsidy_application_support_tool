import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import stylesheet from "./globals.css?url"
import { Amplify } from "aws-amplify"
import awsExports from '~/aws-exports';
Amplify.configure(awsExports);

import { Loading } from "~/components/util"

export const meta: MetaFunction = () => {
  return [
    { title: "大阪市学童補助金支援ツール Ver.0.1" },
    { name: "description", content: "補助金の申請って大変だよね!" },
  ];
};

export const links: LinksFunction = () => [
  {rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"},
  {rel: "stylesheet", href: stylesheet},
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {Loading(useNavigation())}
        <main className="container">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
