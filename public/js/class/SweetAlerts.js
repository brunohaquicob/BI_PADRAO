class SweetAlert {
    static async confirm(message) {
        const result = await Swal.fire({
            title: 'Confirmação',
            html: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        });

        return result.isConfirmed;
    }

    static success(message) {
        Swal.fire({
            title: 'Sucesso',
            html: message,
            icon: 'success',
        });
    }

    static error(message) {
        Swal.fire({
            title: 'Erro',
            html: message,
            icon: 'error',
        });
    }

    static info(message) {
        Swal.fire({
            title: 'Informação',
            html: message,
            icon: 'info',
        });
    }
    static alertAutoClose(tipo = "success", title = "Feito", msg = "Estamos trabalhando em sua requisição, aguarde!", timer = 5000, img = "N",) {
        
        let css = tipo == 'success' ? 'text-center' : '';
        let html = '<div class="card">';
        html += '<div class="card-body text-left '+css+'" style="max-height:400px;">';
        html += msg;
        html += '</div>';
        html += '</div>';
        html += '<h5>Fechando em: <b><span id="swalCountClose"></h5>';
        
        var timerInterval;
        Swal.fire({
            title: title,
            confirmButtonColor: '#b5bbc8',
            icon: tipo,
            imageUrl: (img == "S") ? "https://blog-static.petlove.com.br/wp-content/uploads/2017/06/filhotes-fofos-1.gif" : (img == "N" ? "" : img),
            timer: timer,
            timerProgressBar: true,
            html: html,
            didOpen: () => {
                Swal.showLoading()
                const b = Swal.getHtmlContainer().querySelector('#swalCountClose')
                timerInterval = setInterval(() => {
                    let formato = timer < 60000 ? "ss" : "mm:ss";
                    let rest = moment(parseInt(Swal.getTimerLeft(), 10)).format(formato);
                    b.textContent = rest;
                }, 500)
            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        });
    }

}