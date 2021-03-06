$(function() {

    function invite(fbuid) {
        FB.ui(
            {
                method: "send",
                to: fbuid,
                link: window['INVITE_LINK'],
                name: window['INVITE_NAME']
            }, function(response) {
                if (response && response["success"]) {
                    _kmq.push(["record", "voting block big blue invite"]);
                }
            }
        );
        return false;
    }

    function apprequest(fbuid, callback) {
        if (DEBUG_APP_REQUESTS) {
            window.setTimeout(function() { if (callback) { callback(fbuid);} }, 1000);
            return;
        }
        FB.ui(
            {
                method: "apprequests",
                to: fbuid,
                message: window['INVITE_NAME']
            }, function(response) {
                if (response && response["to"] && response["to"].length > 0 && callback) {
                    _kmq.push(["record", "voting block app request"]);
                    callback(fbuid);
                }
            }
        );
        return false;
    }

    function batchInvited(fbuid) {
        var uninvited = $("#uninvited");
        uninvited.find(".invite").hide();
        uninvited.find(".invited").show();
        $.getJSON(
            MARK_BATCH_URL,
            { "fbuid": fbuid },
            function(result) {
                $(window).trigger('checkNotifications');
                uninvited.html(result["friends_batch_html"]);
                if (result['num_friends'] > result['num_invited']) {
                    uninvited.find(".invite").show();
                    uninvited.find(".invited").hide();
                }
                fillInInvitedBadges(result["num_invited"], result["num_friends"]);
            });
    }

    function fillInInvitedBadges(numInvited, numFriends) {
        $("#num-invited").text(numInvited + "");
        $(".invited-badges .badge").each(function() {
            var cutoff = $(this).data("cutoff");
            if (cutoff != -1 && cutoff < numInvited) {
                $(this).addClass("badge-accomplished");
            }
            else if (cutoff == -1 && numInvited >= numFriends) {
                $(this).addClass("badge-accomplished");
            }
        });
    }

    $(".mission-box-mass").on("click", "a.invite", function(e) {
        var fbuids = [];
        var $uninvited = $(this).parents(".uninvited");
        $uninvited.find("img").each(function() {
            fbuids.push($(this).data("uid"));
        });
        var that = this;
        apprequest(
            fbuids.join(","),
            batchInvited
        );
        return;
    });

    $('.invite-to-block').click(function(e){ invite(); });

});
