module.exports = function Resp (isSucceeded, messagesArr, data) {
    var response = {
        success : isSucceeded,
        messages : messagesArr,
        data : data
    };
    this.getResponse = () => {
        return response;
    };
};