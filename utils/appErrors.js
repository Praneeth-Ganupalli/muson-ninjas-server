const handleDuplicateKeyError=(er)=>{
    const duplicateFields = Object.keys(er.errorResponse.keyValue);
    const message = `Provided ${duplicateFields.join(',')} already exists please try with different value(s)`
    return message;
}
exports.handleJwtExpiredError = ()=>{
    return `Token Expired Please Login Again to continue`;
}
exports.handleDuplicateKeyError = handleDuplicateKeyError;
