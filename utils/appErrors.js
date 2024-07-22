const handleDuplicateKeyError=(er)=>{
    const duplicateFields = Object.keys(er.errorResponse.keyValue);
    const message = `Provided ${duplicateFields.join(',')} already exists please try with different value(s)`
    return message;
}
exports.handleJwtExpiredError = ()=>{
    return `Token Expired Please Login Again to continue`;
}
exports.handleInvalidJwt = ()=>{
    return {
        message:'Invalid token please login again',
        code:401
    }
}
exports.handleDuplicateKeyError = handleDuplicateKeyError;
