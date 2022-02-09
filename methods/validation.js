const validatePassword = (pswd) => {
  const specialCharArr = ['@', '#', '$', '%', '!', '*', '&', '*', '+', '-', '/', '>', '<', '/', '_']
  if(pswd==='')
    return(false);
  if(pswd<8)
    return(false);
  let numberChar = false;
  let letterChar = false;
  let specialCharr = false;
  for(let i=0;i<pswd.length;i++) {
    if(pswd[i]<='9' && pswd>='0')
      numberChar = true;
    if(pswd[i]<='z' && pswd[i]>='a')
      letterChar = true;
    if(pswd[i]<='Z' && pswd[i]>='A')
      letterChar = true;
    if(specialCharArr.indexOf(pswd[i])>-1)
      specialCharr = true;
  }
  if(numberChar===false || letterChar===false || specialCharr===false)
    return(false);
  return(true);
}

const validateEmail = (eml) => {
  if(eml==='')
    return(false);
  if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(eml))
    return(true);
  return(false);
}

const validateName = (nm) => {
  if(nm.length>21 || nm==='')
    return(false);
  return(true);
}

const validateUsername = (usernm) => {
  if(usernm.length<3)
    return(false);
  return(true);
}

const validateAll = ({password, email, username, name}) => {
  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);
  const isNameValid = validateName(name);
  const isUsernameValid = validateUsername(username);
  if(isEmailValid && isPasswordValid && isNameValid && isUsernameValid)
    return(true);
  else
    return(false);
}

module.exports = {
  validatePassword
}