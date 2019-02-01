module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/users/login')
    }
  };

