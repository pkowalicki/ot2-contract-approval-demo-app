const request = require("request");
require("dotenv").config();

const viewerLoader = async (req, authorization) => {
    let getRequest = {
        method: "get",
        url: process.env.BASE_URL + '/viewer/api/v1/viewers/' + req.params.viewer + '/' + req.params[0],
        headers: {
            'Authorization': authorization
        }
    };

    return new Promise((resolve, reject) => {
        request(getRequest, (error, response) => {
            if (error) throw new Error("Error in receiving viewer boot loader " + error);
            if (response.statusCode !== 200) {
                let responseBody = JSON.parse(response.body);
                console.log('Request failed: ', responseBody);
                return reject({
                    status: response.statusCode,
                    description: responseBody != null && responseBody.fault != null ? responseBody.fault.faultstring : responseBody.details
                });
            }
            resolve(response.body);
        });
    });
}


const getRendition = async (req, authorization) => {
    let getRequest = {
        method: "get",
        url: process.env.BASE_URL + '/css/v2/content/' + req.params[0],
        headers: {
            'Authorization': authorization
        }
    };

    return new Promise((resolve, reject) => {
        request(getRequest, (error, response) => {
            if (error) throw new Error("Error in getting rendition " + error);
            if (response.statusCode !== 200) {
                let responseBody = JSON.parse(response.body);
                console.log('Request failed: ', responseBody);
                return reject({
                    status: response.statusCode,
                    description: responseBody != null && responseBody.fault != null ? responseBody.fault.faultstring : responseBody.details
                });
            }
            resolve(response.body);
        });
    });
}



module.exports = {
    viewerLoader,
    getRendition
}