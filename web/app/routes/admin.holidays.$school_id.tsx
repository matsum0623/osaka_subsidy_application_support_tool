import {
  useLoaderData,
  redirect,
  ClientLoaderFunctionArgs,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { useState } from "react";
import { getIdToken } from "~/api/auth";
import { getData, putData } from "~/api/fetchApi";
import { weekday, Loading  } from "~/components/util";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  // データを取ってくる
  const idToken = await getIdToken();
  if (!idToken){
    return redirect(`/`)
  }else{
    const now_year = new Date().getFullYear().toString()
    const last_year = (new Date().getFullYear() - 1).toString()
    const next_year = (new Date().getFullYear() + 1).toString()
    // 休日設定を取得
    const holidays: { [key: string]: string } = await getData(`/after_school/${params.school_id}/holidays/?year=${now_year}`, idToken)
    // 日本の祝日を取得
    const japan_holidays: { [key: string]: string } = await fetch('https://holidays-jp.github.io/api/v1/date.json', {
      method: "GET",
    }).then(response => {
      if(response.status == 200){
          return response.json()
      }else {
          return {}
      }
    }).catch(
        error => {throw error}
    )
    const data = {
      holidays: holidays,
      japan_holidays: japan_holidays,
      idToken: idToken,
      school_id: params.school_id,
      now_year: now_year,
      years: [next_year, now_year, last_year]
    }
    return data
  }
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()
  if (!data.idToken){
    redirect("/");
  }

  const navigate = useNavigate()

  const [selected_year, setSelectedYear] = useState((new Date().getFullYear()).toString())
  const [holidays, setHolyDays] = useState<{ [key: string]: string }>(data.holidays)
  const [change_flag, setChangeFlag] = useState(false)
  const [ct, setCt] = useState(0)
  const [is_loading, setIsLoading] = useState("idle")

  const handleSubmit = async () => {
    setIsLoading("submitting")
    await putData(`/after_school/${data.school_id}/holidays`, {year: selected_year, holidays: holidays}, data.idToken)
    setIsLoading("idle")
  }

  const setAllJapanHolydays =  () => {
    Object.keys(data.japan_holidays).filter((item:string) => item.includes(selected_year)).map((item:string) => (
      holidays[item] = data.japan_holidays[item]
    ))
    setChangeFlag(true)
    setCt(ct+1)
  }
  const deleteHoliday = (item:string) => {
    const newHolidays = { ...holidays };
    delete newHolidays[item];
    setHolyDays(newHolidays);
    setChangeFlag(true)
    setCt(ct + 1);
  }
  const changeYear = async (year:string) => {
    if(change_flag){
      const change_confirm = confirm('変更が保存されていません。年度を変更しますか？')
      if(!change_confirm){
        return
      }
    }
    setSelectedYear(year)
    const holidays: { [key: string]: string } = await getData(`/after_school/${data.school_id}/holidays/?year=${year}`, data.idToken)
    setHolyDays(holidays)
    setChangeFlag(false)
    setCt(ct+1)
  }

  const navigation = useNavigation()

  return (
    <div>
      {Loading((navigation.state == 'loading' || navigation.state == 'submitting') ? navigation : {state: is_loading})}
      <div className="border-t-2">
        <div className="flex justify-between my-2">
          <div className="flex">
            <p className="text-2xl font-bold">休日設定</p>
            <select id="HolidaysSelect" className="select w-28 text-xl py-0 ml-4" value={selected_year} onChange={(e) => changeYear(e.target.value)}>
              {data.years.map((item:string) => (
                <option key={item} value={item}>{item}年</option>
              ))}
            </select>
          </div>
          <div className="col text-right mr-5">
            <button type="button" value={"保存"} className="btn-primary" onClick={handleSubmit}>保存</button>
            <button type="button" value={"戻る"} className="btn-danger ml-4" onClick={() => navigate('/admin/after_school/' + data.school_id)}>戻る</button>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-full">
            <div className="flex justify-start">
              <p className="text-xl my-2">設定休日</p>
            </div>
            <table id="Holidays" className="w-full text-center mt-3">
              <thead>
                <tr>
                  <td>日付</td>
                  <td>祝日名</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {Object.keys(holidays).sort().map((item:string) => (
                  <tr key={item} className={(new Date(item)).getDay()==6 ? "bg-cyan-100" : ((new Date(item)).getDay()==0 ? "bg-red-100" : "")}>
                    <td>{item}({weekday[(new Date(item)).getDay()]})</td>
                    <td>{holidays[item]}</td>
                    <td className="p-0"><button type="button" className="btn-danger p-2 py-1" onClick={() => deleteHoliday(item)}>削除</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-32">
          </div>
          <div className="w-full">
            <div className="flex justify-start">
              <p className="text-xl my-2">日本の祝日</p>
              <button type="button" className="btn-primary ml-2" onClick={setAllJapanHolydays}>すべて設定</button>
            </div>
            <table id="JapanHolidays" className="w-full text-center mt-3">
              <thead>
                <tr>
                  <td>日付</td>
                  <td>祝日名</td>
                </tr>
              </thead>
              <tbody>
                {Object.keys(data.japan_holidays).sort().filter((item:string) => item.includes(selected_year)).map((item:string) => (
                  <tr key={item} className={(new Date(item)).getDay()==6 ? "bg-cyan-100" : ((new Date(item)).getDay()==0 ? "bg-red-100" : "")}>
                    <td>{item}({weekday[(new Date(item)).getDay()]})</td>
                    <td>{data.japan_holidays[item]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
