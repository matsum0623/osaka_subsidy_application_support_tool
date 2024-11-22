import {
  useNavigate,
  useLoaderData,
  Outlet,
  ClientLoaderFunctionArgs,
  Form,
  useMatches,
  useNavigation,
} from "@remix-run/react";
import { getData } from "~/api/fetchApi";
import { Header } from "~/components/header";
import { useRef, useState } from "react";
import { Loading, viewMonth, viewMonthList } from "~/components/util";
import { getLs } from "~/lib/ls";
import { checkInstructor } from "~/lib/common_check";

export const clientLoader = async ({
  params,
}: ClientLoaderFunctionArgs) => {
  const idToken = getLs('idToken') || ''
  const data = JSON.parse(getLs('user_data') || '{}')
  data.idToken = idToken
  data.ym = (!params.ym || !params.school_id) ? viewMonth() : params.ym
  data.school_id = (!params.ym || !params.school_id) ? data.user_data.after_schools[0].school_id : params.school_id

  const res = await getData(`/monthly?ym=${data.ym}&school_id=${data.school_id}`, idToken)
  data.search_results = res.list
  data.config = res.config

  data.ym_list = viewMonthList()

  // 月初のデータを取得
  data.daily_data = await getData(`/monthly/daily?date=${data.ym}-01&school_id=${data.school_id}`, idToken)

  return data
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>()

  const navigate = useNavigate();
  const matches = useMatches()

  // State管理
  const [search_ym, setSearchDate] = useState(data.ym)
  const [search_school_id, setSearchSchoolId] = useState(data.school_id)
  const [search_results, setSearchResults] = useState(data.search_results)

  const [edit_school_id, setEditSchoolId] = useState(data.school_id)
  const [edit_date, setEditDate] = useState(`${data.ym}-01`)
  const [instructors, setInstructors] = useState(data.daily_data.instructors)
  const [sum_hours, setSumHours] = useState(data.daily_data.sum_hours)
  const [open_type, setOpenType] = useState(data.daily_data.open_type)
  const [children_sum, setChildrenSum] = useState(data.daily_data.instructors)
  const [children_disability, setChildrenDisability] = useState(data.daily_data.instructors)
  const [children_medical_care, setChildrenMedicalCare] = useState(data.daily_data.instructors)

  //const [instChk, setInstChk] = useState(checkInstructor(context.instructors, context.config.open_types[context.open_type]).check) // 指導員の配置チェック
  const [instChk, setInstChk] = useState(false)
  const [excess_shortage_config, setExcessShortageConfig] = useState({})

  const [is_loading, setIsLoading] = useState("idle")

  const changeParams = async (ym:string, school_id:string) => {
    setIsLoading("loading")
    setSearchDate(ym)
    setSearchSchoolId(school_id)
    const res = await getData(`/monthly?ym=${ym}&school_id=${school_id}`, data.idToken)
    setSearchResults(res.list)
    setIsLoading("idle")
  }

  const calcExcessShortageConfig = (config:any) => {
    const open = config.OpenTime
    const close = config.CloseTime
    let [open_h, open_m] = open.split(':').map((s:string) => parseInt(s))
    const time_dict: { [key: string]: any[] } = {}
    let tmp_list = []
    let pre_hour = undefined
    while(true){
      if(pre_hour == undefined){
        pre_hour = open_h
      }else if(pre_hour != open_h){
        time_dict[('00' + String(pre_hour)).slice(-2)] = tmp_list
        pre_hour = open_h
        tmp_list = []
      }
      const start_key = ('00' + String(open_h)).slice(-2) + ':' + ('00' + String(open_m)).slice(-2)
      if(start_key >= close){
          break
      }
      open_m += 15
      if(open_m >= 60){
          open_h += 1
          open_m -= 60
      }
      tmp_list.push([start_key, ('00' + String(open_h)).slice(-2) + ':' + ('00' + String(open_m)).slice(-2)])
    }
    if(tmp_list.length > 0){
      time_dict[('00' + String(pre_hour)).slice(-2)] = tmp_list
    }
    return time_dict
  }

  const setEditParams = async (school_id:string, date:string, child:boolean = false) => {
    setIsLoading("loading")
    await getData(`/monthly/daily?school_id=${school_id}&date=${date}`, data.idToken).then((res) => {
      setInstructors(res.instructors)
      setSumHours(res.summary.hours)
      setOpenType(res.open_type)
      setChildrenSum(res.children.sum)
      setChildrenDisability(res.children.disability)
      setChildrenMedicalCare(res.children.medical_care)
      setInstChk(checkInstructor(res.instructors, data.config.open_types[res.open_type]).check)
      setExcessShortageConfig(calcExcessShortageConfig(data.config.open_types[res.open_type]))
    })
    setEditSchoolId(school_id)
    setEditDate(date)
    if (child){
      navigate(`/monthly/edit`)
    }
    setIsLoading("idle")
  }

  const downloadCsv = async (school_id:string, ym:string, idToken:string, anchorRef:any) => {
    setIsLoading("loading")
    const data = await getData("/monthly/download?ym=" + ym + '&school_id=' + school_id, idToken)
    const link = anchorRef.current
    link.setAttribute('href', data.url)
    link.setAttribute('download', `【1307】月次報告（令和${ym}年${ym}月分）`)
    link.click()
    setIsLoading("idle")
  }

  const anchorRef = useRef<HTMLAnchorElement>(null)
  const navigation = useNavigation()

  return (
    <div>
      {Loading((navigation.state == 'loading' || navigation.state == 'submitting') ? navigation : {state: is_loading})}
      {Header(data.user_data)}
      {
        (matches.length < 3 || (matches.length == 3 && !matches[2].pathname.includes('/edit/'))) &&
        <div className="flex justify-between bg-white border-t-2 sticky top-12 sm:top-20">
          <Form>
            <div className="flex">
              <div className="p-2">
                <select name="school_id" className="select" value={search_school_id} onChange={(e) => changeParams(search_ym ,e.target.value)}>
                  {data.user_data.after_schools.map((item:any) => (
                    <option key={item.school_id} value={item.school_id}>{item.school_id + ':' + item.school_name}</option>
                  ))}
                </select>
              </div>
              <div className="p-2">
                <select name="ym" className="select" value={search_ym} onChange={(e) => changeParams(e.target.value, search_school_id)}>
                  {data.ym_list.map((item:any) => (
                    <option key={item.value} value={item.value}>{item.value.split('-').join('年') + '月' + (item.confirm ? ' 確定済み' : '')}</option>
                  ))}
                </select>
              </div>
              <div className="ms-auto p-2 hidden sm:block">
                <button type="button" onClick={() => downloadCsv(search_school_id, search_ym, data.idToken, anchorRef)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">CSVダウンロード</button>
                <a ref={anchorRef} className='hidden'></a>
              </div>
            </div>
          </Form>
        </div>
      }
      <Outlet context={{
        id_token: data.idToken,
        search_school_id: search_school_id,
        search_ym: search_ym,
        edit_school_id: edit_school_id,
        edit_date: edit_date,
        search_results: search_results,
        config: data.config,
        instructors: instructors,
        sum_hours: sum_hours,
        open_type: open_type,
        children_sum: children_sum,
        children_disability: children_disability,
        children_medical_care: children_medical_care,
        instChk: instChk,
        excess_shortage_config: excess_shortage_config,
        setEditParams: setEditParams,
        changeParams: changeParams,
        setInstructors: setInstructors,
        setOpenType: setOpenType,
        setChildrenSum: setChildrenSum,
        setChildrenDisability: setChildrenDisability,
        setChildrenMedicalCare: setChildrenMedicalCare,
        setSumHours: setSumHours,
        setIsLoading: setIsLoading,
        setInstChk: setInstChk,
        setExcessShortageConfig: setExcessShortageConfig,
        calcExcessShortageConfig: calcExcessShortageConfig,
      }}/>
    </div>
  );
}
