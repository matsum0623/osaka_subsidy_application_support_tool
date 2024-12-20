import {
  Form,
  useNavigate,
  useOutletContext,
} from "@remix-run/react"
import React from "react";
import { useState } from "react";
import { postData } from "~/api/fetchApi";
import { createDates, weekday } from "~/components/util";
import { checkInstructor } from "~/lib/common_check";

export default function Index() {
  const context: {
    id_token: string,
    search_school_id: string,
    search_ym: string,
    edit_date: string,
    search_results: object[],
    config: {
      open_types: any,
    }
    setEditParams(school_id: string, date: string): void,
    changeParams(ym: string, school_id: string): void,
    instructors: { [key: string]: { start: string, end: string, hours: string, additional_check?: boolean } },
    open_type: string,
    open_time: any,
    sum_hours: string,
    children_sum: string,
    children_disability: string,
    children_medical_care: string,
    instChk: boolean,
    setInstructors(instructors:{ [key: string]: { start: string, end: string, hours: string, additional_check?: boolean } }): void
    setOpenType(open_type: string): void,
    setOpenTime(open_time: any): void,
    setChildrenSum(children_sum: string): void,
    setChildrenDisability(children_disability: string): void,
    setChildrenMedicalCare(children_medical_care: string): void,
    setSumHours(sum_hour: string): void,
    setIsLoading(is_loading: string): void,
    setInstChk(inst_chk: boolean): void,
  } = useOutletContext();

  const navigate = useNavigate()

  const [modal_open, setModalOpen] = useState(false)
  const [go_next, setGoNext] = useState(false)

  const [ct, setCt] = useState(0) // 再描画用のState

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
      open_time: context.open_time,
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
    const open = value != '9' ? context.config.open_types[value].OpenTime : context.open_time.start
    const close = value != '9' ? context.config.open_types[value].CloseTime : context.open_time.end
    context.setOpenType(value)
    context.setOpenTime({
      start: open,
      end: close
    })
    context.setInstChk(checkInstructor(context.instructors, open, close).check)
  }

  const changeOpenTime = (start:any, end:any) => {
    context.setOpenTime({
      start: start,
      end: end
    })
  }

  const instructorCheck = () => {
    const open = context.open_type != '9' ? context.config.open_types[context.open_type].OpenTime : context.open_time.start
    const close = context.open_type != '9' ? context.config.open_types[context.open_type].CloseTime : context.open_time.end
    const check_response = checkInstructor(context.instructors, open, close)
    context.setInstChk(check_response.check)
  }

  const check_cell_class = (start:string, end:string, chk_start:string, chk_end:string, qua:boolean, add:boolean) => {
    // 勤務時間外はfalse
    const border_right = chk_start.split(':')[1] == '45' ? ' border-r-gray-500' : ''
    if (start == "" || end == "" || start > chk_start || end < chk_end) return '' + border_right
    if (add) return 'bg-blue-200' + border_right
    if (qua) return 'bg-green-200' + border_right
    return 'bg-lime-200' + border_right
  }

  const excess_shortage_cell = (excess_shortage:any, chk_start:string, type:string) => {
    const border_right = chk_start.split(':')[1] == '45' ? ' border-r-gray-500' : ''
    if (!(chk_start in excess_shortage)){
      return <td className={"px-0 sm:p-2" + border_right}></td>
    }
    if (type == 'qua'){
      if (excess_shortage[chk_start].shortage.qua > 0){
        return <td className={"bg-red-400 px-0 sm:p-2" + border_right}></td>
      }else if (excess_shortage[chk_start].excess.qua > 0){
        return <td className={"bg-blue-400 px-0 sm:p-2" + border_right}>{excess_shortage[chk_start].excess.qua}</td>
      }
    } else if (type == 'sub'){
      if ((excess_shortage[chk_start].shortage.num - excess_shortage[chk_start].shortage.qua) > 0){
        return <td className={"bg-red-200 px-0 sm:p-2" + border_right}></td>
      }else if ((excess_shortage[chk_start].excess.num - excess_shortage[chk_start].excess.qua) > 0){
        return <td className={"bg-blue-200 px-0 sm:p-2" + border_right}>{excess_shortage[chk_start].excess.num - excess_shortage[chk_start].excess.qua}</td>
      }
    }
    return <td className={"px-0 sm:p-2" + border_right}></td>
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
    Object.values(context.instructors).filter((inst) => inst.hours).reduce((result:any, inst:any) => {
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
    const open = context.open_type != '9' ? context.config.open_types[context.open_type].OpenTime : context.open_time.start
    const close = context.open_type != '9' ? context.config.open_types[context.open_type].CloseTime : context.open_time.end
    const check_response = checkInstructor(context.instructors, open, close)
    context.setInstChk(check_response.check)
    context.setInstructors(context.instructors)
    setCt(ct + 1)
  }

  const CancelClick = () => {
    context.changeParams(context.search_ym, context.search_school_id)
    navigate(`/monthly`)
  }

  const calcExcessShortageConfig = (open:any, close:any) => {
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

  let excess_shortage_config = calcExcessShortageConfig(context.open_time.start, context.open_time.end)
  let excess_shortage = checkInstructor(context.instructors, context.open_time.start, context.open_time.end).excess_shortage

  const OpenExcessShortageModal = () => {
    excess_shortage = checkInstructor(context.instructors, context.open_time.start, context.open_time.end).excess_shortage
    excess_shortage_config = calcExcessShortageConfig(context.open_time.start, context.open_time.end)
    setModalOpen(true)
  }

  return (
    <div>
      <div className="bg-white flex justify-between border-t-2 sticky top-12 sm:top-20 pt-2">
        <div className="text-base sm:text-2xl flex gap-3 justify-center sm:justify-start">
          <div className="flex">
            <input type="date" value={context.edit_date} onChange={(e) => changeDate(e.target.value)} className="input-default sm:text-xl sm:py-1" />
            <span className="hidden sm:block py-2">({weekday[now_dt.getDay()]})</span>
          </div>
          <span className={'py-2 ' + (context.instChk ? 'text-green-500' : 'text-red-500 font-bold')}>{context.instChk ? "OK" : "NG"}</span>
            <button type="button" className="btn-primary min-w-10" onClick={() => changeDate(prev_dt.toISOString().slice(0, 10))}>
              <span className="hidden sm:block">前日</span>
              <span className="sm:hidden">前</span>
            </button>
            <button type="button" className="btn-primary min-w-10" onClick={() => changeDate(next_dt.toISOString().slice(0, 10))}>
              <span className="hidden sm:block">翌日</span>
              <span className="sm:hidden">翌</span>
            </button>
          </div>
        <div className="text-base sm:text-2xl flex">
          <button type="button" className="btn-primary min-w-10" onClick={() => OpenExcessShortageModal()}>
            <span className="hidden sm:block">チェック</span>
            <span className="sm:hidden">CHK</span>
          </button>
        </div>
      </div>

      {/** 過不足確認ダイアログ */}
      <div id="excess-shortage-modal" tabIndex={-1}
        className={(modal_open ? "block" : "hidden") + " modal-back-ground"}
        onClick={(e) => {
          if((e.target as HTMLElement).id == 'excess-shortage-modal'){
            setModalOpen(false)
          }
        }}>
        <div className="modal-dialog max-w-7xl top-0 sm:top-32 p-1 SM-P-4">
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
            <div className="modal-body overflow-scroll">
              <table className="w-full text-xs sm:text-base">
                <thead>
                  <tr>
                    <td rowSpan={3}><span className="hidden sm:block">指導員名</span></td>
                    <td colSpan={99} className="py-1 sm:p-2">勤務時間</td>
                  </tr>
                  <tr>
                    {Object.keys(excess_shortage_config).sort((a:any, b:any) => (a - b)).map((key:string) => (
                      <td className="py-1 sm:p-2" colSpan={excess_shortage_config[key].length} key={key}>{key}</td>
                    ))}
                  </tr>
                  <tr className="hidden sm:table-row">
                    {Object.keys(excess_shortage_config).sort((a:any, b:any) => (a - b)).map((key:string) => {
                      return excess_shortage_config[key].map((time:any) => {
                        return <td key={key + time} className="px-0"><span className="hidden sm:block">{time[0].split(':')[1]}</span></td>
                      })
                    })}
                  </tr>
                </thead>
                <tbody>
                  {
                    Object.values(context.instructors).sort((a:any, b:any) => (a.order - b.order)).map((inst: any) => {
                      return (
                        <tr key={'es' + inst.id}>
                          <td className="table-cell sm:hidden px-0">{inst.name.slice(0,2)}</td>
                          <td className="hidden sm:table-cell">{inst.name}</td>
                          {Object.keys(excess_shortage_config).sort((a:any, b:any) => (a - b)).map((key:string) => {
                            return excess_shortage_config[key].map((time:any) => {
                              return <td className={check_cell_class(inst.start, inst.end, time[0], time[1], inst.qualification, inst.additional_check) + " px-0 sm:p-2"} key={time[0]}></td>
                            })
                          })}
                        </tr>
                      )
                    })
                  }
                  <tr className="border-t-4" key='es_inst'>
                    <td>
                      <span className="hidden sm:block">過不足(指)</span>
                      <span className="sm:hidden">指</span>
                    </td>
                    {Object.keys(excess_shortage_config).sort((a:any, b:any) => (a - b)).map((key:string) => {
                      return excess_shortage_config[key].map((time:any) => {
                        return <React.Fragment key={time[0]}>{excess_shortage_cell(excess_shortage, time[0], 'qua')}</React.Fragment>
                      })
                    })}
                  </tr>
                  <tr key='es_sub'>
                    <td>
                      <span className="hidden sm:block">過不足(補)</span>
                      <span className="sm:hidden">補</span>
                    </td>
                    {Object.keys(excess_shortage_config).sort((a:any, b:any) => (a - b)).map((key:string) => {
                      return excess_shortage_config[key].map((time:any) => {
                        return <React.Fragment key={time[0]}>{excess_shortage_cell(excess_shortage, time[0], 'sub')}</React.Fragment>
                      })
                    })}
                  </tr>
                </tbody>
              </table>


            </div>
          </div>
        </div>
      </div>

      <Form method="post" onSubmit={(e) => handleSubmit(e)}>
        <div className="sm:flex mt-3 w-full text-center">
          <div className="flex w-full sm:w-2/5 justify-between">
            <div className="w-full border">
              <div className="hidden sm:block border-b font-bold p-1">開所パターン</div>
              <div>
                <select className="py-2 sm:px-2 text-sm" name="open_type" value={context.open_type} onChange={(e) => changeOpenType(e.target.value)}>
                  {
                    Object.keys(context.config.open_types).map((key:string) => (
                      <option value={key} key={key}>{context.config.open_types[key].TypeName}</option>
                    ))
                  }
                  <option value={9} key={9}>{"日曜加算"}</option>
                </select>
              </div>
            </div>
            <div className="flex sm:block w-full border justify-between">
              <div className="hidden sm:block w-1/4 sm:w-full border-b font-bold p-1">開所時間</div>
              <div className="w-full sm:px-2 py-2 flex justify-center gap-1 sm:gap-2">
                <input className={context.open_type != '9' ? "icon-del" : ""} name={"times.open.start"} value={context.open_time.start} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => changeOpenTime(e.target.value, context.open_time.end)} onBlur={() => instructorCheck()} disabled={context.open_type != '9'}/>
                <span>～</span>
                <input className={context.open_type != '9' ? "icon-del" : ""} name={"times.open.end"} value={context.open_time.end} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => changeOpenTime(context.open_time.start, e.target.value)} onBlur={() => instructorCheck()} disabled={context.open_type != '9'}/>
              </div>
            </div>
          </div>
          <div className="flex w-full sm:w-3/5">
            <div className="flex sm:block w-full border">
              <div className="w-1/4 sm:w-full border-b font-bold p-1">
                <span className="hidden sm:block">児童数</span>
                <span className="block sm:hidden">児</span>
              </div>
              <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="children" type="number" value={context.children_sum} onChange={(e) => context.setChildrenSum(e.target.value)}/></div>
            </div>
            <div className="flex sm:block w-full border">
              <div className="w-1/4 sm:w-full border-b font-bold p-1">
                <span className="hidden sm:block">障がい</span>
                <span className="block sm:hidden">障</span>
              </div>
              <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="disability" type="number" value={context.children_disability} onChange={(e) => context.setChildrenDisability(e.target.value)}/></div>
            </div>
            <div className="flex sm:block w-full border">
              <div className="w-1/4 sm:w-full border-b font-bold p-1">
                <span className="hidden sm:block">医ケア</span>
                <span className="block sm:hidden">医</span>
              </div>
              <div className="w-3/4 sm:w-full px-2"><input className="text-right input-default" name="medical_care" type="number" value={context.children_medical_care} onChange={(e) => context.setChildrenMedicalCare(e.target.value)}/></div>
            </div>
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
                  <td className="py-0.5 sm:py-2 text-base table-cell sm:hidden">{inst.name.slice(0,2)}</td>
                  <td className="py-0.5 sm:py-2 text-base hidden sm:table-cell">{inst.name}</td>
                  <td className="py-0.5 sm:py-2 hidden sm:table-cell">{(inst.qualification) ? '〇' : ''}</td>
                  <td className="py-0.5 sm:py-2 hidden sm:table-cell">{(inst.additional) ? '〇' : ''}</td>
                  <td className="py-0.5 sm:py-2 hidden sm:table-cell">{(inst.medical_care) ? '〇' : ''}</td>
                  <td className="py-0.5 sm:py-2"><input name={"times." + inst.id + ".start"} value={inst.start} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)} onBlur={() => instructorCheck()}/></td>
                  <td className="py-0.5 sm:py-2"><input name={"times." + inst.id + ".end"} value={inst.end} type="time" min={"06:00:00"} max={"22:00:00"} step={"900"} onChange={(e) => setHour(e.target)} onBlur={() => instructorCheck()}/></td>
                  <td className="py-0.5 sm:py-2"><input name={"times." + inst.id + ".hour"} value={inst.hours} type="hidden" />{inst.hours}</td>
                  <td className="py-0.5 sm:py-2"><input name={"additional." + inst.id} checked={inst.additional_check} type="checkbox" disabled={!inst.additional || inst.hours == ''} onChange={(e) => changeAdditional(inst.id, e.target.checked)}/></td>
                </tr>
              )})
            }
            <tr key='sum'>
              <td className="py-0.5 sm:py-2">合計</td>
              <td className="py-0.5 sm:py-2 table-cell sm:hidden" colSpan={2}></td>
              <td className="py-0.5 sm:py-2 hidden sm:table-cell" colSpan={5}></td>
              <td className="py-0.5 sm:py-2"><input name={"hour_summary"} defaultValue={context.sum_hours} type="hidden" />{context.sum_hours}</td>
              <td className="py-0.5 sm:py-2"></td>
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