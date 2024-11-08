import {
  Form,
  useNavigate,
  useOutletContext,
} from "@remix-run/react"
import { useState } from "react";
import { postData } from "~/api/fetchApi";
import { createDates, weekday } from "~/components/util";
import { checkInstructor } from "~/lib/common_check";

export default function Index() {
  const context: {
    id_token: string,
    search_school_id: string,
    edit_date: string,
    search_results: object[],
    config: {
      open_types: any,
    }
    setEditParams(school_id: string, date: string): void,
    instructors: { [key: string]: { start: string, end: string, hours: string, additional_check?: boolean } },
    open_type: string,
    sum_hours: string,
    children_sum: string,
    children_disability: string,
    children_medical_care: string,
    setInstructors(instructors:{ [key: string]: { start: string, end: string, hours: string, additional_check?: boolean } }): void
    setOpenType(open_type: string): void,
    setChildrenSum(children_sum: string): void,
    setChildrenDisability(children_disability: string): void,
    setChildrenMedicalCare(children_medical_care: string): void,
    setSumHours(sum_hour: string): void,
    setIsLoading(is_loading: string): void,
  } = useOutletContext();

  const navigate = useNavigate()

  const [modal_open, setModalOpen] = useState(false)
  const [go_next, setGoNext] = useState(false)

  const [instChk, setInstChk] = useState(checkInstructor(context.instructors, context.config.open_types[context.open_type]).check) // 指導員の配置チェック
  const [ct, setCt] = useState(0) // 再描画用のState
  const [excess_shortage, setExcessShortage] = useState<JSX.Element>(<div key="default">過不足はありません</div>)

  const [now_dt, prev_dt, next_dt] = createDates(context.edit_date)

  const changeDate = (dt:string) => {
    context.setEditParams(context.search_school_id, dt);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    context.setIsLoading("submitting")
    e.preventDefault();
    const post_data = {
      school_id: context.search_school_id,
      date: now_dt.toISOString().slice(0, 10),
      open_type: context.open_type,
      instructors: context.instructors,
      children: {
          sum: context.children_sum,
          disability: context.children_disability,
          medical_care: context.children_medical_care,
      },
      summary: {
          hours: context.sum_hours,
      },
    }
    await postData("/monthly/daily", post_data, context.id_token)
    if(go_next){
      changeDate(next_dt.toISOString().slice(0, 10))
    }
    context.setIsLoading("idle")
  }

  const changeOpenType = (value:string) => {
    context.setOpenType(value)
    setInstChk(checkInstructor(context.instructors, context.config.open_types[value]).check)
  }

  const instructorCheck = () => {
    const check_response = checkInstructor(context.instructors, context.config.open_types[context.open_type])
    setInstChk(check_response.check)
    updateExcessShortage(check_response.excess_shortage)
  }

  const updateExcessShortage = (excess_shortage:any) => {
    console.log(excess_shortage)
    const excess:any[] = []
    const shortage:any[] = []
    console.log(excess_shortage)
    let pre_key:string = ''
    let pre_num:number = 0
    Object.keys(excess_shortage).sort().map((key:string) => {
      if(pre_key == ''){
        pre_key = key
        pre_num = excess_shortage[key].excess.num
      }else{

      }
    })
    return
    /*
    Object.keys(excess_shortage).map((key:string) => {
      if(excess_shortage[key].excess.num > 0){
        excess.push([key, excess_shortage[key].excess.num])
      }else if(excess_shortage[key].shortage.num > 0){
        shortage.push([key, excess_shortage[key].shortage.num])
      }
    })
    if(excess.length == 0 || shortage.length == 0){
      setExcessShortage(<div key="default">過不足はありません</div>)
      return
    }
    console.log(excess.length)
    const excess_html = (
      <div>
        {construct_html(excess, 'excess')}
      </div>
    )

    console.log(excess_html, shortage)
    setExcessShortage(excess_html)
    */
  }

  const setHour = (target:any) => {
    const [id, k] = target.name.split('.').slice(-2)
    const start_time = (k == 'start') ? target.value : context.instructors[id].start
    const end_time = (k == 'end') ? target.value : context.instructors[id].end
    if (!start_time || !end_time){
      context.instructors[id].start = start_time
      context.instructors[id].end = end_time
      context.instructors[id].hours = ''
    }else if (start_time >= end_time){
      // TODO: 不正な登録の場合は画面に表示する
      console.log("不正な時刻登録です", start_time, end_time)
      context.instructors[id].hours = ''
    }else{
      const [start_hour, start_min] = start_time.split(':').map((i:any) => (parseInt(i)))
      const [end_hour, end_min] = end_time.split(':').map((i:any) => (parseInt(i)))
      const hour_min = start_min > end_min ? end_min - start_min + 60 : end_min - start_min
      const hour_hour = start_min > end_min ? end_hour - start_hour - 1 : end_hour - start_hour
      context.instructors[id].hours = hour_hour + ':' + ( '00' + hour_min ).slice( -2 )
      context.instructors[id].start = start_time
      context.instructors[id].end = end_time
    }
    context.setInstructors(context.instructors)

    let sum_hour = 0
    let sum_min = 0
    Object.values(context.instructors).map((inst:any) => {
      if (inst.hours){
        const [hour, min] = inst.hours.split(':')
        sum_hour += parseInt(hour)
        sum_min += parseInt(min)
      }
    })
    const res = Object.values(context.instructors).filter((inst) => inst.hours).reduce((result:any, inst:any) => {
      const [hour, min] = inst.hours.split(':').map((i:any) => (parseInt(i)))
      result.sum_hour += hour
      result.sum_min += min
      return result
    }, {
      sum_hour: 0,
      sum_min: 0
    })
    sum_hour += Math.floor(sum_min / 60)
    sum_min = sum_min % 60
    context.setSumHours(sum_hour + ':' + ( '00' + sum_min ).slice( -2 ))
    setCt(ct + 1)
  }

  const changeAdditional = (id:string, checked:boolean) => {
    context.instructors[id].additional_check = checked
    const check_response = checkInstructor(context.instructors, context.config.open_types[context.open_type])
    setInstChk(check_response.check)
    updateExcessShortage(check_response.excess_shortage)
    context.setInstructors(context.instructors)
    setCt(ct + 1)
  }

  const CancelClick = () => {
    navigate(`/monthly`)
  }

  return (
    <div>
      <div className="bg-white flex justify-between border-t-2 sticky top-12 sm:top-20 pt-2">
        <div className="text-base sm:text-2xl flex gap-3 justify-center sm:justify-start">
          <div className="flex">
            <input type="date" value={context.edit_date} onChange={(e) => changeDate(e.target.value)} className="input-default sm:text-xl sm:py-1" />
            <span className="hidden sm:block py-2">({weekday[now_dt.getDay()]})</span>
          </div>
          <span className={'py-2 ' + (instChk ? 'text-green-500' : 'text-red-500 font-bold')}>{instChk ? "OK" : "NG"}</span>
            <button type="button" className="btn-primary" onClick={() => changeDate(prev_dt.toISOString().slice(0, 10))}>前日</button>
            <button type="button" className="btn-primary" onClick={() => changeDate(next_dt.toISOString().slice(0, 10))}>翌日</button>
          </div>
        <div className="text-base sm:text-2xl">
          <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>チェック</button>
        </div>
      </div>

      {/** 過不足確認ダイアログ */}
      <div id="excess-shortage-modal" tabIndex={-1}
        className={(modal_open ? "block" : "hidden") + " modal-back-ground"}
        onClick={(e) => {
          if((e.target as HTMLElement).id == 'edit-modal'){
            setModalOpen(false)
          }
        }}>
        <div className="modal-dialog">
          <div className="modal-content">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  指導員過不足確認
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setModalOpen(false)}>
                  <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="modal-body">
              </div>
              <div className="modal-footer">
              </div>
          </div>
        </div>
      </div>

      <Form method="post" onSubmit={(e) => handleSubmit(e)}>
        <div className="sm:flex mt-3 w-full text-center">
          <div className="w-full border">
            <div className="hidden sm:block border-b font-bold p-1">開所パターン</div>
            <div>
              <select className="p-2" name="open_type" value={context.open_type} onChange={(e) => changeOpenType(e.target.value)}>
                {
                  Object.keys(context.config.open_types).map((key:string) => (
                    <option value={key} key={key}>{context.config.open_types[key].TypeName + "(" + context.config.open_types[key].OpenTime + "-" + context.config.open_types[key].CloseTime + ")"}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <div className="flex sm:block w-full border">
            <div className="w-1/4 sm:w-full border-b font-bold p-1">児童数</div>
            <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="children" type="number" value={context.children_sum} onChange={(e) => context.setChildrenSum(e.target.value)}/></div>
          </div>
          <div className="flex sm:block w-full border">
            <div className="w-1/4 sm:w-full border-b font-bold p-1">障がい</div>
            <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="disability" type="number" value={context.children_disability} onChange={(e) => context.setChildrenDisability(e.target.value)}/></div>
          </div>
          <div className="flex sm:block w-full border">
            <div className="w-1/4 sm:w-full border-b font-bold p-1">医ケア</div>
            <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="medical_care" type="number" value={context.children_medical_care} onChange={(e) => context.setChildrenMedicalCare(e.target.value)}/></div>
          </div>
        </div>

        <table className="table table-bordered text-center mt-3 w-full">
          <thead>
            <tr>
              <td>氏名</td>
              <td className="hidden sm:table-cell">指</td>
              <td className="hidden sm:table-cell">加</td>
              <td className="hidden sm:table-cell">医</td>
              <td>開始</td>
              <td>終了</td>
              <td>時間</td>
              <td>加配</td>
            </tr>
          </thead>
          <tbody>
            {
              Object.values(context.instructors).sort((a:any, b:any) => (a.order - b.order)).map((inst: any) => {
                return (
                <tr key={inst.id}>
                  <td className="text-base table-cell sm:hidden">{inst.name.slice(0,2)}</td>
                  <td className="text-base hidden sm:table-cell">{inst.name}</td>
                  <td className="hidden sm:table-cell">{(inst.qualification) ? '〇' : ''}</td>
                  <td className="hidden sm:table-cell">{(inst.additional) ? '〇' : ''}</td>
                  <td className="hidden sm:table-cell">{(inst.medical_care) ? '〇' : ''}</td>
                  <td><input name={"times." + inst.id + ".start"} value={inst.start} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)} onBlur={() => instructorCheck()}/></td>
                  <td><input name={"times." + inst.id + ".end"} value={inst.end} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)} onBlur={() => instructorCheck()}/></td>
                  <td><input name={"times." + inst.id + ".hour"} value={inst.hours} type="hidden" />{inst.hours}</td>
                  <td><input name={"additional." + inst.id} checked={inst.additional_check} type="checkbox" disabled={!inst.additional || inst.hours == ''} onChange={(e) => changeAdditional(inst.id, e.target.checked)}/></td>
                </tr>
              )})
            }
            <tr>
              <td>合計</td>
              <td colSpan={2} className="table-cell sm:hidden"></td>
              <td colSpan={5} className="hidden sm:table-cell"></td>
              <td><input name={"hour_summary"} defaultValue={context.sum_hours} type="hidden" />{context.sum_hours}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <p className="text-end mt-2">
          <button type="submit" name='next' value={next_dt.toISOString().slice(0, 10)} className="btn-primary mr-3" onClick={() => setGoNext(true)}>登録して翌日</button>
          <button type="submit" className="btn-primary mr-3" onClick={() => setGoNext(false)}>登録</button>
          <button onClick={() => CancelClick()} type="button" className="btn btn-danger sm:mr-10">戻る</button>
        </p>
        <input type='hidden' name="school_id" value={context.search_school_id} />
        <input type='hidden' name="date" value={now_dt.toISOString().slice(0, 10)} />
      </Form>

    </div>
  )
}