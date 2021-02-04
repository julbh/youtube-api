import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import axios from "axios";
import getConfig from "next/config";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Grid,
    TextField
} from "@material-ui/core";


import styles from "../../../styles/Home.module.css";
import Loader from "react-loader-spinner";
import dynamic from "next/dynamic";
import moment from "moment";
const ReactApexChart = dynamic(
    () => {
        return import("react-apexcharts")
    },
    {ssr: false}
);
const Calendar = dynamic(
    () => {
        return import("react-multi-date-picker").then((mod) => mod.Calendar)
    },
    {ssr: false}
);

function DetailPage() {

    const {id} = useRouter().query;
    const [loading, setLoading] = useState(false);
    const {API_ENDPOINT} = getConfig().publicRuntimeConfig;
    const [data, setData] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [chartTitle, setChartTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [value, setValue] = useState([new Date()]);

    const [series, setSeries] = useState([
        {
            data: [],
            name: 'Views'
        },
        {
            data: [],
            name: 'Likes'
        },
        {
            data: [],
            name: 'Comments'
        }
    ]);

    function handleChangeRowsPerPage(event) {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }


    //TODO: compare date
    function compare(a, b) {
        if (a > b) return -1;
        if (b > a) return 1;

        return 0;
    }

    let sortedArray = value.sort(compare);

    function handleChangePage(event, newPage) {
        setPage(newPage);
    }

    const options = {
        chart: {
            type: 'bar',
            height: 430,
            grid: {
                show: true,
                borderColor: 'black',
                strokeDashArray: 0,
                position: 'back',
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: false
                    }
                },
                row: {
                    colors: undefined,
                    opacity: 0.5
                },
                column: {
                    colors: undefined,
                    opacity: 0.5
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
            }
        },
        title: {
            text: chartTitle,
            align: 'right',
            margin: 30,
            offsetY: 393,
            floating: true,
            style: {
                fontSize:  '16px',
                fontWeight:  'bold',
                color:  '#000',
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: true,
            offsetX: -6,
            style: {
                fontSize: '12px',
                colors: ['#fff']
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['#fff']
        },
        xaxis: {
            categories: categories,
            labels: {
                show: false
            }
        },
        colors: ['#0000ff', '#ff0000', '#00ff00']
    };

    //TODO: get graph data using momentjs
    const getGraphData = () => {
        if (data.length === 0) {
            return;
        }
        if (value.length === 0) {
            return;
        }
        if (!value[0].day) {
            return;
        }
        setLoading(true);
        let months = [];
        let seriParam = [
            {
                data: [],
                name: 'Views'
            },
            {
                data: [],
                name: 'Likes'
            },
            {
                data: [],
                name: 'Comments'
            }
        ];
        for (let i = 0; i < sortedArray.length; i++) {
            console.log(sortedArray[i].month);
            let formattedDate = sortedArray[i].year + '-' + pad_with_zeroes(sortedArray[i].month.number) + '-' + pad_with_zeroes(sortedArray[i].day);
            let formarttedmonth = moment(formattedDate).format('DD-MMM-YYYY')
            months.push(formarttedmonth);
            let index = data.findIndex(x => x.date == formattedDate);
            let machedItem = data[index];
            if (machedItem) {
                seriParam[0].data.push(machedItem.views);
                seriParam[1].data.push(machedItem.likes);
                seriParam[2].data.push(machedItem.comments);
            } else {
                seriParam[0].data.push(0);
                seriParam[1].data.push(0);
                seriParam[2].data.push(0);
            }
            console.log(seriParam)
        }
        setCategories(months);
        setSeries([...seriParam]);
        setLoading(false);
    };


    //TODO: add zero when it's number is 1 length
    const pad_with_zeroes = (number) => {

        var my_string = '' + number;
        while (my_string.length < 2) {
            my_string = '0' + my_string;
        }

        return my_string;

    };

    const getData = async () => {
        setLoading(true);
        var config = {
            method: 'get',
            url: `${API_ENDPOINT}data?id=${id}`,
            headers: {}
        };

        try {
            const res = await axios(config);
            setData(res.data.data);
            setLoading(false);
            let initialCategory = [];
            initialCategory.push(moment(res.data.data[0].date).format('DD-MMM-YYYY'));

            setCategories(initialCategory);
            setSeries(
                [
                    {
                        data: [res.data.data[0].views],
                        name: 'Views'
                    },
                    {
                        data: [res.data.data[0].likes],
                        name: 'Likes'
                    },
                    {
                        data: [res.data.data[0].comments],
                        name: 'Comments'
                    }
                ]
            )
        } catch (e) {
            console.log("error while fetching", e);
            setLoading(false)
        }
    };


    useEffect(() => {
        getData();
    }, [id]);

    useEffect(() => {
        getGraphData()
    }, [data, value]);

    function handleChangeCalendar(e) {
        setValue(e);
    }

    function handleChangeTitle(e) {
        setChartTitle(e.target.value)
    }

    return (
        <div>
            {
                loading ? <div className={styles.customLoading}>
                    <Loader
                        type="Bars"
                        color="#00BFFF"
                        height={100}
                        width={100}
                        visible={loading}
                    />
                </div> : null
            }


            <Grid container spacing={1} alignItems='center' justify='center'>
                <Grid item xs={12} md={3}>
                    <Calendar
                        value={value}
                        onChange={handleChangeCalendar}
                        multiple
                        maxDate={new Date()}
                    />
                </Grid>
                <Grid item xs={12} md={9}>
                    <Paper style={{padding: '2rem'}}>
                        <div>
                            <TextField id="outlined-basic" label="Package Name" variant="outlined" value={chartTitle} onChange={handleChangeTitle}/>
                        </div>
                        <div id="chart">
                            <ReactApexChart options={options} series={series} type="bar" height={430}/>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
            {/*<TableContainer component={Paper}>*/}
            {/*    <Table aria-label="simple table">*/}
            {/*        <TableHead>*/}
            {/*            <TableRow>*/}
            {/*                <TableCell>Link</TableCell>*/}
            {/*                <TableCell align="right">Client</TableCell>*/}
            {/*                <TableCell align="right">Views</TableCell>*/}
            {/*                <TableCell align="right">Likes</TableCell>*/}
            {/*                <TableCell align="right">Comments</TableCell>*/}
            {/*                <TableCell align="right">Date</TableCell>*/}
            {/*            </TableRow>*/}
            {/*        </TableHead>*/}
            {/*        <TableBody>*/}
            {/*            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (*/}
            {/*                <TableRow key={index} style={{cursor: 'pointer'}} onClick={() => {*/}
            {/*                    handleClick(index)*/}
            {/*                }}>*/}
            {/*                    <TableCell component="th" scope="row">*/}
            {/*                        {row ? row.linkURL : ''}*/}
            {/*                    </TableCell>*/}
            {/*                    <TableCell align="right">{row ? row.client : ''}</TableCell>*/}
            {/*                    <TableCell align="right">{row ? row.views : ''}</TableCell>*/}
            {/*                    <TableCell align="right">{row ? row.likes : ''}</TableCell>*/}
            {/*                    <TableCell align="right">{row ? row.comments : ''}</TableCell>*/}
            {/*                    <TableCell align="right">{row ? row.date : ''}</TableCell>*/}
            {/*                </TableRow>*/}
            {/*            ))}*/}
            {/*        </TableBody>*/}
            {/*    </Table>*/}
            {/*</TableContainer>*/}
            {/*<TablePagination*/}
            {/*    rowsPerPageOptions={[5, 10, 25]}*/}
            {/*    component="div"*/}
            {/*    count={data.length}*/}
            {/*    rowsPerPage={rowsPerPage}*/}
            {/*    page={page}*/}
            {/*    onChangePage={handleChangePage}*/}
            {/*    onChangeRowsPerPage={handleChangeRowsPerPage}*/}
            {/*/>*/}
        </div>
    )
}

export default DetailPage
