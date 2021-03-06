import { success, notFound } from '../../services/response/'
import { User } from '.'
import { sign } from '../../services/jwt'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  User.find(query, select, cursor)
    .then((users) => users.map((user) => user.view()))
    .then(success(res))
    .catch(next)

export const noValidated = ({ querymen: { query, select, cursor } }, res, next) => {
  query.validated = false
  User.find(query, select, cursor)
    .then((users) => users.map((user) => user.view()))
    .then((users) => {
      if (users.length == 0)
        return res.sendStatus(404)
      else
        return users
    })
    .then(success(res))
    .catch(next)
}

export const show = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.view() : null)
    .then(success(res))
    .catch(next)

export const showMe = ({ user }, res) =>
  res.json(user.view(true))

// export const create = ({ bodymen: { body } }, res, next) => {
export const create = (req, res, next) => {
  let nuevoUsuario = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  }

  if (req.file != undefined) {
    nuevoUsuario.picture = {
      data: req.file.buffer.toString('base64'),
      contentType: req.file.mimetype
    }
  }
  User.create(nuevoUsuario)
  /*User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    picture: {
      data: req.file.buffer.toString('base64'),
      contentType: req.file.mimetype
    }
  })*/
    /*.then(user => {
      sign(user.id)
        .then((token) => ({ token, user: user.view(true) }))
        .then(success(res, 201))
    })*/
    .then(user => user.view(true))
    .then(success(res, 201))
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'email',
          message: 'email already registered'
        })
      } else {
        next(err)
      }
    })
}
export const updateName = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isAdmin = user.role === 'admin'
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: 'You can\'t change other user\'s data'
        })
        return null
      }
      return result
    })
    .then((user) => user ? Object.assign(user, body).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const updateImg = (req, res, next) =>
  User.findById(req.params.id === 'me' ? req.user.id : req.params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isAdmin = req.user.role === 'admin'
      const isSelfUpdate = req.user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: 'You can\'t change other user\'s data'
        })
        return null
      }
      return result
    })
    // .then((user) => user ? Object.assign(user, body).save() : null)
    .then((user) => {
      user.picture = {
        data : req.file.buffer.toString('base64'), 
        contentType : req.file.mimetype
      }
      // user.picture.data = req.file.buffer.toString('base64')
      // user.picture.contentType = req.file.mimetype
      return user.save()
    })
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const validarUsuario = (req, res, next) =>
  User.findById(req.params.id === 'me' ? req.user.id : req.params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isAdmin = req.user.role === 'admin'
      const isSelfUpdate = req.user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: 'You can\'t change other user\'s data'
        })
        return null
      }
      return result
    })
    // .then((user) => user ? Object.assign(user, body).save() : null)
    .then((user) => {
      user.validated = true
      return user.save()
    })
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const convertirEnTecnico = (req, res, next) =>
  User.findById(req.params.id === 'me' ? req.user.id : req.params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isAdmin = req.user.role === 'admin'
      const isSelfUpdate = req.user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: 'You can\'t change other user\'s data'
        })
        return null
      }
      return result
    })
    // .then((user) => user ? Object.assign(user, body).save() : null)
    .then((user) => {
      user.role = 'tecnico'
      return user.save()
    })
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const updatePassword = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          param: 'password',
          message: 'You can\'t change other user\'s password'
        })
        return null
      }
      return result
    })
    .then((user) => user ? user.set({ password: body.password }).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.remove() : null)
    .then(success(res, 204))
    .catch(next)

export const deleteImg = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => {
      user.picture = undefined
      return user.save()
    })
    .then(success(res))
    .catch(next)

export const getImage = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => {
      if (user.picture != undefined) {
          res.contentType(user.picture.contentType)
          res.send(Buffer.from(user.picture.data, 'base64'))
      }
      else
        res.sendStatus(404)
    })
    // .then(success(res, 200))
    .catch(next)
