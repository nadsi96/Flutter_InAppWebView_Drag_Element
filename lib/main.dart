import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:get/get.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (Platform.isAndroid) {
    await AndroidInAppWebViewController.setWebContentsDebuggingEnabled(true);
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatelessWidget {
  MyHomePage({Key? key, required this.title}) : super(key: key);

  var title;

  late InAppWebViewController inAppWebViewController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blue,
      appBar: AppBar(
        title: Text(title),
      ),
      body: Column(
        children: [
          Expanded(
            child: InAppWebView(
              initialFile: "assets/slide_prac.html",
              initialOptions: InAppWebViewGroupOptions(
                  // disable scaling
                  crossPlatform: InAppWebViewOptions(supportZoom: false)),
              onWebViewCreated: (controller) {
                inAppWebViewController = controller;
              },
              onConsoleMessage: (controller, consoleMessage) {
                // 콘솔 찍히는거 출력
                print("____________________Console Message");
                print(consoleMessage);
              },
            ),
          ),
          SizedBox(
            height: 40,
            child: Row(
              children: [
                btn(dir: 'left'),
                btn(dir: 'right'),
                btn(dir: 'top'),
                btn(dir: 'bottom'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget btn({required String dir}) {
    return Expanded(
      child: InkWell(
        onTap: () {
          sendMessageToWeb(dir);
        },
        child: DecoratedBox(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.black),
            color: Colors.blue,
          ),
          child: Center(
            child: Text(dir, style: const TextStyle(fontSize: 20)),
          ),
        ),
      ),
    );
  }

  // 웹으로 메시지 던지기
  void sendMessageToWeb(msg) {
    if (inAppWebViewController != null) {
      print("========================sendMessageToWeb");
      print(msg);
      inAppWebViewController.evaluateJavascript(source: "appToWeb('$msg')");
    }
  }
}
