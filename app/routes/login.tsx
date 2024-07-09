import {
  Form,
  ClientActionFunctionArgs,
  redirect,
  useSearchParams
} from "@remix-run/react";
import { signIn, signOut } from 'aws-amplify/auth'

export const clientLoader = async () => {
  // この画面にくる場合はサインアウトさせる
  await signOut({ global: true })
  return []
};

export const clientAction = async({
  request,
}: ClientActionFunctionArgs) => {
  const formData = await request.formData()
  const isLogin = await signIn({
    username: formData.get("username")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  }).then((res)=>{
    return true
  }).catch((e) => {
    return false
  })
  console.log(isLogin)
  if (isLogin){
    return redirect(`/`);
  }else{
    return redirect(`/?auth_error`)
  }
}

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <main className="form-signin w-100 m-auto">
      <Form method="post" className="text-center">
        <h1 className="h3 mb-3 fw-normal">ログイン</h1>
        <div className="form-floating">
          <input type="email" className="form-control" id="floatingInput" name="username" placeholder="name@example.com" required/>
          <label htmlFor="floatingInput">Emailアドレス</label>
        </div>
        <div className="form-floating">
          <input type="password" className="form-control" id="floatingPassword" name="password" placeholder="パスワード" required/>
          <label htmlFor="floatingPassword">パスワード</label>
        </div>
        <p className="text-danger">{searchParams.has('auth_error') && "ユーザ、またはパスワードが間違っています。"}</p>

        <div className="form-check text-start my-3">
          <input className="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault" />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            状態を記憶する
          </label>
        </div>
        <button className="btn btn-primary w-100 py-2" type="submit">サインイン</button>
      </Form>
    </main>
  );
}
