import { viewMonth } from './util'

export function Header(user_data:any) {
  // 月次報告は20日締めなので、20日までは前月
  const today = new Date()
  const school_id = user_data.after_schools[0].school_id
  const ym = viewMonth()

  return (
    <div className="container sticky top-0 bg-white">
      <header className="bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-2 sm:p-6 sm:px-8" aria-label="Global">
          <div className="flex sm:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">月次報告作成サイト</span>
              <img className="h-8 w-auto" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600" alt=""/>
            </a>
          </div>
          <div className="flex sm:gap-x-12">
            <a href={"/monthly/" + school_id + '/' + ym} className="text-sm font-semibold leading-6 text-gray-900">月次報告</a>
            {
              user_data.admin &&
              <a href="/admin" className="hidden sm:flex text-sm font-semibold leading-6 text-gray-900">管理画面</a>
            }
          </div>
          <div className="flex sm:flex-1 sm:justify-end">
            <a href="/logout" className="text-sm font-semibold leading-6 text-gray-900">ログアウト<span aria-hidden="true">&rarr;</span></a>
          </div>
        </nav>
      </header>
    </div>
  );
}