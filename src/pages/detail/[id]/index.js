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
    TableRow
} from "@material-ui/core";

import ReactApexChart from 'react-apexcharts'
import moment from 'moment'



function DetailPage() {
    const {id} = useRouter().query;
    const [loading, setLoading] = useState(false);
    const {API_ENDPOINT} = getConfig().publicRuntimeConfig;
    const [data, setData] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [categories, setCategories] = useState([]);
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

    function handleChangePage(event, newPage) {
        setPage(newPage);
    }

    const options = {
        chart: {
            type: 'bar',
            height: 430
        },
        plotOptions: {
            bar: {
                horizontal: false,
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
            width: 1,
            colors: ['#fff']
        },
        xaxis: {
            categories: categories,
        },
    };

    //TODO: get graph data using momentjs
    const getGraphData = ()=> {
        console.log('data=============>', data);
        if (data.length === 0) {
            return;
        }
        const monthFrom = moment().subtract(1, 'years');
        const monthTo = moment(new Date());
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
        for (let m = moment(monthFrom); m.isBefore(monthTo); m.add(1, 'months')) {

            let count = 0;
            let totalViews = 0;
            let totalComments = 0;
            let totalLikes = 0;

            const month = m.format('MMM YYYY');
            months.push(month);

            let startOfMonth = moment(m.startOf('month').format('YYYY-MM-DD hh:mm a'));
            let endOfMonth = moment(m.endOf('month').format('YYYY-MM-DD hh:mm a'));

            for (let i = 0; i < data.length; i++) {
                let singleData = data[i];
                let eventDate = moment(moment(singleData.date).format('YYYY-MM-DD hh:mm a'));
                if (eventDate.isAfter(startOfMonth) && eventDate.isBefore(endOfMonth)) {
                    count ++ ;
                    totalViews += singleData.views;
                    totalLikes += singleData.likes;
                    totalComments += singleData.comments;
                }
            }
            if (count === 0) {
                seriParam[0].data.push(0);
                seriParam[1].data.push(0);
                seriParam[2].data.push(0);
            } else {
                seriParam[0].data.push(totalViews/count);
                seriParam[1].data.push(totalLikes/count);
                seriParam[2].data.push(totalComments/count);
            }

        }
        console.log(seriParam, "================", months);
        setCategories(months);
        setSeries([...seriParam]);
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
            setLoading(false)
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
    }, [data]);
    return (
        <div>
            <div id="chart">
                <ReactApexChart options={options} series={series} type="bar" height={430}/>
            </div>

            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Link</TableCell>
                            <TableCell align="right">Client</TableCell>
                            <TableCell align="right">Views</TableCell>
                            <TableCell align="right">Likes</TableCell>
                            <TableCell align="right">Comments</TableCell>
                            <TableCell align="right">Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                            <TableRow key={index} style={{cursor: 'pointer'}} onClick={() => {
                                handleClick(index)
                            }}>
                                <TableCell component="th" scope="row">
                                    {row ? row.linkURL : ''}
                                </TableCell>
                                <TableCell align="right">{row ? row.client : ''}</TableCell>
                                <TableCell align="right">{row ? row.views : ''}</TableCell>
                                <TableCell align="right">{row ? row.likes : ''}</TableCell>
                                <TableCell align="right">{row ? row.comments : ''}</TableCell>
                                <TableCell align="right">{row ? row.date : ''}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </div>
    )
}

export default DetailPage
