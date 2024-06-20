import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import stylesheet from "./globals.css?url"

export const links: LinksFunction = () => [
  {rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"},
  {rel: "stylesheet", href: stylesheet},
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
      <div id="sidebar">
          <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="nav-wrapper">
              <a href="#" className="brand-logo">月次報告作成サイト</a>
              <ul id="nav-mobile" className="right hide-on-med-and-down">
                {/*
                <li><a href="sass.html">Sass</a></li>
                <li><a href="badges.html">Components</a></li>
                <li><a href="collapsible.html">JavaScript</a></li>
                -*/}
              </ul>
            </div>
          </nav>
        </div>
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
