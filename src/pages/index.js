import {
    Paper,
    TableRow,
    TableHead,
    TableContainer,
    TableCell,
    TableBody,
    Table,
    TablePagination,
    Grid
} from '@material-ui/core';

import {useEffect, useState} from "react";
import {useRouter} from 'next/router'
import getConfig from 'next/config';
import axios from "axios";
import Loader from 'react-loader-spinner'
import styles from '../styles/Home.module.css'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';


function Home() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const {API_ENDPOINT} = getConfig().publicRuntimeConfig;
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [links, setLinks] = useState([]);
    const [data, setData] = useState([]);
    const getLinks = async () => {
        setLoading(true);
        var config = {
            method: 'get',
            url: `${API_ENDPOINT}links`,
            headers: {}
        };

        try {
            const res = await axios(config);
            setLinks(res.data.data);
            setLoading(false)
        } catch (e) {
            setLoading(false)
        }

    };

    const getData = async () => {
        const formattedDate = selectedDate.getFullYear() + "-" + pad_with_zeroes(selectedDate.getMonth() + 1) + "-" + pad_with_zeroes(selectedDate.getDate());
        setLoading(true);
        var config = {
            method: 'get',
            url: `${API_ENDPOINT}data?date=${formattedDate}`,
            headers: { }
        };

        try {
            const res = await axios(config);
            setData(res.data.data);
            setLoading(false)
        } catch (e) {
            console.log(e);
            setLoading(false)
        }
    };

    const rows = data.map((item, index) => {
        let linkIndex = links.findIndex(x => x.id == item.link);
        if (linkIndex > -1) {
            return({
                ...item, linkURL: links[linkIndex].link, client: links[linkIndex].client
            })
        }

    });


    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    //TODO: add zero when it's number is 1 length
    const pad_with_zeroes = (number) => {

        var my_string = '' + number;
        while (my_string.length < 2) {
            my_string = '0' + my_string;
        }

        return my_string;

    }

    function handleClick(index) {
        const id = data[index].link;
        router.push(`/detail/${id}`)
    }

    useEffect(() => {
        getLinks();
        getData();
    }, []);


    useEffect(() => {
        getData();
    }, [selectedDate]);
    function handleChangeRowsPerPage(event) {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }

    function handleChangePage(event, newPage) {
        setPage(newPage);
    }

    return (
        <div>
            {
                loading? <div className={styles.customLoading}>
                    <Loader
                        type="Bars"
                        color="#00BFFF"
                        height={100}
                        width={100}
                        visible={loading}
                    />
                </div> : null
            }
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container justify='space-around' style={{padding: '20px'}}>
                    <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Date picker inline"
                        value={selectedDate}
                        onChange={handleDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </Grid>

            </MuiPickersUtilsProvider>
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Link</TableCell>
                            <TableCell align="right">Client</TableCell>
                            <TableCell align="right">Views</TableCell>
                            <TableCell align="right">Likes</TableCell>
                            <TableCell align="right">Comments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                            <TableRow key={index} style={{cursor: 'pointer'}} onClick={() => {
                                handleClick(index)
                            }}>
                                <TableCell component="th" scope="row">
                                    {row ? row.linkURL : ''}
                                </TableCell>
                                <TableCell align="right">{row? row.client: ''}</TableCell>
                                <TableCell align="right">{row? row.views : ''}</TableCell>
                                <TableCell align="right">{row? row.likes: ''}</TableCell>
                                <TableCell align="right">{row? row.comments: ''}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </div>
    )
}

export default Home;
