var cluster = require('cluster');

function startWorker() {
  var worker = cluster.fork();
  console.log('CLUSTER: Worker %d started', worker.id); 
}


if (cluster.isMaster) {
  console.log('cluster is master');
  require('os').cpus().forEach(function() {
    startWorker();
  });

  // log any workers taht disconnect; if a worker disconnects, it
  // sould then exit, so we'll wait for the exit event to spawn
  // a new worker to replace it

  cluster.on('disconnect', function(worker) {
    console.log('CLUSTER: Worker %d disconnected from the cluster', worker.id);    
  });

  cluster.on('exit', function(worker, code, signal) {
    console.log('CLUSTER: worker %d died with exit code %d (%s)', worker.id, code, signal);
    startWorker();
  });

} else {
  console.log('cluster is fork');
  var www =  require('./www');
  
  require('./www')();
}