const collegeDataModule = require('./modules/collegeData');
var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.engine(
  '.hbs',
  exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: { equal, navLink },
  })
);
app.set('view engine', '.hbs');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    '/' +
    (isNaN(route.split('/')[1])
      ? route.replace(/\/(?!.*)/, '')
      : route.replace(/\/(.*)/, ''));
  next();
});

function equal(lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error('Handlebars Helper equal needs 2 parameters');
  if (lvalue != rvalue) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
}

function navLink(url, options) {
  return (
    '<li' +
    (url == app.locals.activeRoute
      ? ' class="nav-item active" '
      : ' class="nav-item" ') +
    '><a class="nav-link" href="' +
    url +
    '">' +
    options.fn(this) +
    '</a></li>'
  );
}

function handleStudents(req, res) {
  const course = req.query['course'];
  if (course) {
    collegeDataModule
      .getStudentsByCourse(course)
      .then(function (response) {
        res.render('students', { students: response });
      })
      .catch(function () {
        res.render('students', { message: 'no results' });
      });
  } else {
    collegeDataModule
      .getAllStudents()
      .then(function (response) {
        res.render('students', { students: response });
      })
      .catch(function () {
        res.render('students', { message: 'no results' });
      });
  }
}

function handleStudent(req, res) {
  const num = req.params['num'];
  if (num) {
    collegeDataModule
      .getStudentByNum(num)
      .then(function (data) {
        res.render('student', { student: data });
      })
      .catch(function () {
        res.json({ message: 'no results' });
      });
  } else {
    res.json({ message: 'no results' });
  }
}

function handleCourses(req, res) {
  collegeDataModule
    .getCourses()
    .then(function (response) {
      res.render('courses', { courses: response });
    })
    .catch(function () {
      res.render('courses', { message: 'no results' });
    });
}

function handleaddStudent(req, res) {
  const payload = req.body;
  collegeDataModule
    .addStudent(payload)
    .then(function () {
      res.redirect('/students');
    })
    .catch(function () {
      console.log('Error while aading student');
    });
}

function handleCourseById(req, res) {
  const id = req.params['id'];
  collegeDataModule
    .getCourseById(id)
    .then(function (data) {
      res.render('course', { course: data });
    })
    .catch(function () {
      res.render('course', { message: 'no results' });
    });
}

function updateStudent(req, res) {
  const payload = req.body;
  collegeDataModule.updateStudent(payload).then(function () {
    res.redirect('/students');
  });
}
app.get('/students', handleStudents);
app.get('/student/:num', handleStudent);
app.post('/students/add', handleaddStudent);
app.get('/courses', handleCourses);
app.get('/courses', handleCourses);
app.get('/course/:id', handleCourseById);
app.post('/student/update', updateStudent);
app.get(['/', '/home'], function (req, res) {
  const home = path.join(__dirname, 'views', 'home');
  res.render(home);
});
app.get('/about', function (req, res) {
  const about = path.join(__dirname, 'views', 'about');
  res.render(about);
});
app.get('/htmlDemo', function (req, res) {
  const htmlDemo = path.join(__dirname, 'views', 'htmlDemo');
  res.render(htmlDemo);
});
app.get('/students/add', function (req, res) {
  const addStudent = path.join(__dirname, 'views', 'addStudent');
  res.render(addStudent);
});

app.use((req, res, next) => {
  res.status(404).send('<h1>Page not found on the server</h1>');
});

// setup http server to listen on HTTP_PORT
collegeDataModule
  .initialize()
  .then(function () {
    app.listen(HTTP_PORT, () => {
      console.log('server listening on port: ' + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log(err);
  });
