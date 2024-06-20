exports.handler = async (event, context) => {

    const response = {
        statusCode: 200, // HTTP 200 OK
        headers: {
            'x-custom-header': 'my custom header value',
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            data: {
                "instructors": [
                  {
                    "id": "0",
                    "name": "濵名　敦子",
                    "start": "11:30",
                    "end": "19:30",
                    "hours": "8:00",
                  },
                  {
                    "id": "1",
                    "name": "髙橋　美穂",
                    "start": "13:15",
                    "end": "19:30",
                    "hours": "6:15",
                  },
                  {
                    "id": "2",
                    "name": "吉村　美穂",
                    "start": "13:15",
                    "end": "19:30",
                    "hours": "6:15",
                  },
                  {
                    "id": "3",
                    "name": "山形　駿雅",
                    "start": "",
                    "end": "",
                    "hours": "",
                  },
                  {
                    "id": "4",
                    "name": "石村　晴",
                    "start": "",
                    "end": "",
                    "hours": "",
                  },
                  {
                    "id": "5",
                    "name": "大江　時生",
                    "start": "",
                    "end": "",
                    "hours": "",
                  },
                  {
                    "id": "6",
                    "name": "加藤　滉太",
                    "start": "",
                    "end": "",
                    "hours": "",
                  },
                  {
                    "id": "7",
                    "name": "横田　里栄",
                    "start": "",
                    "end": "",
                    "hours": "",
                  },
                  {
                    "id": "8",
                    "name": "角田　翼",
                    "start": "",
                    "end": "",
                    "hours": "",
                  },
                  {
                    "id": "9",
                    "name": "櫻木　龍馬",
                    "start": "",
                    "end": "",
                    "hours": "",
                  },
                ],
                "children": {
                  "sum": 20,
                  "disability": 1,
                  "medical_care": 0,
                },
                "summary": {
                  "hours": "24:00",
                }
              },
        })
    };

    return response;
};