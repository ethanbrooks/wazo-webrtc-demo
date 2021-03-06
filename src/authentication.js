const { Wazo } = window['@wazo/sdk'];
Wazo.Auth.init('wazo-webrtc-demo');

const displayAuthError = (error) => {
  $('#auth-error').html(error.message).show();
  $('#submit-login').prop('disabled', false);
};

const authenticate = async (username, password, server) => {
  try {
    Wazo.Auth.setHost(server);

    const session = await Wazo.Auth.logIn(username, password).catch();
    // Useful to retrieve the server from localstorage
    session.server = server;
    setSessionOnStorage(session);

    onLogin(session);
  } catch (e) {
    displayAuthError(e);
  }
};

const openLogin = () => {
  $('.alert').hide();
  $('#login-form').on('submit', async (e) => {
    e.preventDefault();

    $('#submit-login').prop('disabled', true);

    authenticate($('#username').val(), $('#password').val(), $('#server').val());
  });
};

const onLogin = () => {
  $('#submit-login').prop('disabled', false);
  $('#authentication').hide();
  $('#phone').show();
  $('#logout').on('click', () => {
    removeSessionOnStorage();
    location.reload();
  });

  initializeWebRtc();
};

const getSessionOnStorage = () => JSON.parse(localStorage.getItem('session'));

const setSessionOnStorage = session => {
  localStorage.setItem('session', JSON.stringify(session));
};

const removeSessionOnStorage = () => {
  localStorage.clear();
};

const launchPhone = async () => {
  const rawSession = getSessionOnStorage();
  if (!rawSession) {
    return openLogin();
  }

  try {
    Wazo.Auth.setHost(rawSession.server);
    const session = await Wazo.Auth.validateToken(rawSession.token, rawSession.refreshToken);
    if (session) {
      return onLogin(session);
    }
  } catch(e) {
    displayAuthError(e);
  }

  openLogin();
};

$(window).on('load', launchPhone);
